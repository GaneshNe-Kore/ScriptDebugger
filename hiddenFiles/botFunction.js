const content = require('../BotVariables/content.json');
const env = require('../BotVariables/env.json');
var context = require('../context.json');
context = context.response?.updatedContext ?? context.updatedContext ?? context;

// PASTE the latest bot function here

var source = context.session.BotUserSession && context.session.BotUserSession.source && context.session.BotUserSession.source ? context.session.BotUserSession.source : "kore";

function format(currency, amount) {
  if (typeof amount === "undefined") {
    return "NA";
  }
  var formatObj = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  };
  var formatter = new Intl.NumberFormat("en-US", formatObj);
  return formatter.format(amount);
}

function convertDateToUSDateTextFormat(x) {
  if (!x) {
    return "NA";
  }
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
  } else {
    return y[2] + " " + y[1].replace(/^0+/, "") + nth(y[1]);
  }
}

function maskCardNumber(cardNumber, character) {
  var maskedNumber = character ? "*" + cardNumber + "*" : cardNumber;
  var maskingNumber = 7;
  character = typeof character === "undefined" || character == null ? "" : character;
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
  return maskedNumber;
}

function ignorewords() {
  return [
    "savings",
    "checking",
    "current",
    "first",
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
    "mortgage",
    "due",
    "of",
    "fee",
    "HELOC","heloc",
    "equity",
    "line",
    "one",
    "second",
    "interest",
    "home",
    "save",
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
    "Credit",
    "credit",
  ];
}
function getUcName(entities = {}, traits = []) {
  var output = {};
  var finalUsecases = context.usecases;
  finalUsecases.forEach((uc) => {
    if (Object.keys(entities).length === 0 && traits.length === 0) {
      output.ucName = uc.useCaseName;
      output.currentFlow = getIntentManagement(uc.code);
    } else {
      if (Object.keys(entities).length === Object.keys(uc.entities).length && traits.length === uc.traits.length) {
        if (areJSONObjectsEqual(entities, uc.entities) && areJsonArraysEqual(traits ? traits : [], uc?.traits ? uc.traits : [])) {
          output.ucName = uc.useCaseName;
          output.currentFlow = getIntentManagement(uc.code, uc.useCaseName);
        }
      }
    }
  });
  context.getUC = output;
  if (Object.keys(output).length === 0) {
    context.currentFlow = true;
  }
  return output;
}

function getIntentManagement(IntentCode, tagName) {
  if (!context.session.BotUserSession.previousSubIntent) {
    context.session.BotUserSession.previousSubIntent = [];
  }
  context.currentFlow = true;
  var envName = IntentCode ? "ID_" + IntentCode.toLowerCase() : null;
  var intentmanagement = envName && env[envName] ? JSON.parse(env[envName]) : {};

  if (tagName) {
    log("tagEmitted: " + context.tagEmitted + " | "  + BotUserSession.get("tagEmitted"));
    // if (!context.tagEmitted) {
    if (!BotUserSession.get("tagEmitted")) {
      tags.addMessageLevelTag("UseCaseStarted", tagName);
      // context.tagEmitted = true;
      BotUserSession.put("tagEmitted", true);
      BotUserSession.put("usecase", tagName);
    }
    if (context.session.BotUserSession.subIntent) {
      if (context.session.BotUserSession.previousSubIntent.length > 5) {
        context.session.BotUserSession.previousSubIntent.unshift();
      }
      if (context.session.BotUserSession.subIntent != "LOGIN") {
        context.session.BotUserSession.previousSubIntent.push(context.session.BotUserSession.subIntent);
      }
    }
    context.session.BotUserSession.subIntent = IntentCode;
    context.session.BotUserSession.useCase = tagName;
  }
  
  BotUserSession.put("IntentCode", envName);
  if (Object.keys(intentmanagement).length < 1) {
    return context.currentFlow;
  }
  var intentRecg = intentmanagement;
  if (intentRecg) {
    context.currentFlow = intentRecg["CurrFlow"] ? intentRecg["CurrFlow"]["enable"] : false;
  }
  log(tags)
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

function sortObject(jsonobj){
  var result = Object.keys(jsonobj).sort().reduce((obj, key) => { obj[key] = jsonobj[key]; 
    return obj;
  }, 
  {}
);
return result;
}

function areJSONObjectsEqual(json1, json2) {
  const stringifiedJson1 = JSON.stringify(sortObject(json1));
  const stringifiedJson2 = JSON.stringify(sortObject(json2));
  return stringifiedJson1 === stringifiedJson2;
}

function readSpeedControl(msg) {
  if (context.session.BotUserSession.preferredChannelType == "audiocodes" && context.session.BotUserSession.client === "tinker") {
    return context.session.BotUserSession.client === "tinker" ? `<prosody rate="80%">${msg}</prosody>` : `<prosody rate="100%">${msg}</prosody>`;
  } else {
    return msg;
  }
}
function nonPreBuilt(subuc, mainUC) {
  var output = [];
  subuc.forEach((uc) => {
    output.push(getIntentManagement(uc));
  });
  var allTrue = output.every((element) => element == false);
  if (allTrue) {
    context.session.BotUserSession.mainUC = mainUC;
    context.currentFlow = false;
  }else{
    context.currentFlow = true;
  }
  return allTrue;
}

function log(...args) {
  for (let list of args) {
    koreDebugger.log(list);
  }
}

function logSfy(obj) {
  koreDebugger.log(JSON.stringify(obj));
}


// Add to exports and where it is used any new funtion or variable is added in bot function's
module.exports = {
  source,
  format,
  convertDateToUSDateTextFormat,
  maskCardNumber,
  ignorewords,
  getUcName,
  getIntentManagement,
  areJsonArraysEqual,
  sortObject,
  areJSONObjectsEqual,
  readSpeedControl,
  nonPreBuilt,
  log,
  logSfy
};

