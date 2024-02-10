
var context = require('../context.json');
// context = context?.response?.updatedContext ? context.response.updatedContext : context;
context = context?.updatedContext ? context.updatedContext : context;
const content = require('./content.json');
const env = require('./env.json');
const moment = require('moment');
const { extend } = require('lodash');
class botUserSession {
  constructor() {
  }

  put(key,value,time) {
    context.session.BotUserSession[key] =value;
  }
  get(key){
    return  context.session.BotUserSession[key];
  }
}
class KoreUtil{
  // var lodash = 
  constructor() {
  }
  // _(){
  //   return ;;
  // }
  _ = require('lodash');
}
class KoreDebugger{
  // var lodash = 
  constructor() {
  }
  log(val){
    console.log(val);
  }
  log(...val){

   console.log( val.join(","));
  }
}
var koreUtil = new KoreUtil();
var BotUserSession = new botUserSession();
var koreDebugger = new KoreDebugger();
var source = context.session.botUserSession && context.session.BotUserSession.source && context.session.BotUserSession.source ? context.session.BotUserSession.source : "kore";
function print(val){
  console.log(val);
}
function format(currency, amount) {
  if (typeof amount === "undefined") {
    return "NA";
  }
  var formatObj = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  };
  if (source === "mashreq") {
    formatObj["currencyDisplay"] = "code";
  }
  var formatter = new Intl.NumberFormat("en-US", formatObj);
  return formatter.format(amount);
}
function convertDateToUSDateTextFormat(x) {
  var d = new Date(x).toUTCString();
  var nth = function (z) {
    if (z > 3 && z < 21) {
      return "th";
    }
    switch (z % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  var y = d.split(" ");
  if (context.session.BotUserSession.isIVR) {
    return y[2] + " " + parseInt(y[1], 10) + nth(y[1]);
  } else if (source === "mashreq") {
    return y[1] + " " + y[2] + " " + y[3];
  } else {
    return y[2] + " " + y[1].replace(/^0+/, "") + nth(y[1]);
  }
}
function maskCardNumber(cardNumber, character) {
  var maskedNumber = character ? "*" + cardNumber + "*" : cardNumber;
  var maskingNumber = source === "mashreq" ? 12 : 7;
  character = typeof character === "undefined" || character == null ? "" : source === "mashreq" ? "*" : character;
  if (source === "mashreq" && cardNumber && String(cardNumber).length <= 10 && character) {
    var placeholder = "";
    for (var i = 0; i < maskingNumber - String(cardNumber).length; i++) {
      placeholder += "0";
    }
    cardNumber = placeholder + String(maskedNumber);
    if (typeof cardNumber === "string") {
      maskedNumber = cardNumber.replace(/.(?=.{5,}$)/g, character);
    }
  } else {
    if (typeof cardNumber === "string") {
      maskedNumber = cardNumber.replace(/.(?=.{4,}$)/g, character);
      maskedNumber = maskedNumber && maskedNumber.length > maskingNumber ? maskedNumber.slice(maskedNumber.length - maskingNumber) : maskedNumber;
      if (maskedNumber.indexOf("-") > -1) {
        maskedNumber = cardNumber.replace(/.(?=.{5,}$)/g, character);
        maskedNumber = maskedNumber && maskedNumber.length > maskingNumber ? maskedNumber.slice(maskedNumber.length - maskingNumber) : maskedNumber;
      }
    } else {
      maskedNumber = String(cardNumber).replace(/\d(?=\d{4})/g, character);
    }
  }
  return source === "mashreq" && character ? maskedNumber.substring(0, 4) + " " + maskedNumber.substring(4, 8) + " " + maskedNumber.substring(8) : maskedNumber;
}
function ignorewords() {
  return [
    "savings",
    "checking",
    "current",
    "acc",
    "accnt",
    "acct",
    "act",
    "account",
    "accounts",
    "balance",
    "minimum",
    "bank",
    "banking",
    "funds",
    "salary",
    "transfer",
    "loan",
    "Loan",
    "personal",
    "mortgage",
    "due",
    "fee",
    "equity",
    "line",
    "interest",
    "save",
    "cash",
    "money",
    "nickname",
    "nick name",
    "card",
    "cd",
    "ira",
    "month",
    "ignore",
    "my",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
}
function getUcName(entities = {}, traits = []) {
  var output = {};
  var finalUsecases = context.usecases;
  finalUsecases.forEach((uc) => {
    if (entities.length === 0 && traits.length === 0) {
      output.ucName = uc.useCaseName;
      output.currentFlow = getIntentManagement(uc.code);
    } else {
      if (entities.length === uc.entities.length && traits.length === uc.traits.length) {
        if (areJSONObjectsEqual(entities, uc.entities) && areJsonArraysEqual(traits ? traits : [], uc?.traits ? uc.traits : [])) {
          output.ucName = uc.useCaseName;
          output.currentFlow = getIntentManagement(uc.code, uc.useCaseName);
        }
      }
    }
  });
  context.getUC = output;
  koreDebugger.log("a" + JSON.stringify(output));
  if (Object.keys(output).length === 0) {
    context.currentFlow = true;
  }
  return output;
}
function getIntentManagement(IntentCode, tagName) {
  context.currentFlow = true;
  var envName = IntentCode ? "ID_" + IntentCode.toLowerCase() : null;
  var intentmanagement = envName && env[envName] ? JSON.parse(env[envName]) : {};
  koreDebugger.log(envName + " : " + JSON.stringify(intentmanagement));
  if (tagName) {
    tags.addMessageLevelTag("UseCaseStarted", tagName);
	tags.addSessionLevelTag("UseCaseStarted",tagName);
    koreDebugger.log("b" + JSON.stringify(tags));
    context.session.BotUserSession.subIntent = IntentCode;
  }
  BotUserSession.put("IntentCode", envName);
  if (Object.keys(intentmanagement).length < 1) {
    return context.currentFlow;
  }
  var intentRecg = intentmanagement;
  // if (intentRecg && context.intentName === "Get_Account_Balance") {
  //   intentRecg = intentRecg["INT_DET"];
  // }
  if (intentRecg) {
    context.currentFlow = intentRecg["CurrFlow"] ? intentRecg["CurrFlow"]["enable"] : false;
  }
  return context.currentFlow;
}
function areJsonArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = JSON.stringify(arr1.sort());
  const sortedArr2 = JSON.stringify(arr2.sort());

  return sortedArr1 === sortedArr2;
}
function areJSONObjectsEqual(json1, json2) {
  const stringifiedJson1 = JSON.stringify(json1);
  const stringifiedJson2 = JSON.stringify(json2);
  return stringifiedJson1 === stringifiedJson2;
}

function test1(context){

}
test1(context);


