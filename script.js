let {source, format, convertDateToUSDateTextFormat, maskCardNumber, ignorewords, getUcName, getIntentManagement, areJsonArraysEqual, sortObject, areJSONObjectsEqual, readSpeedControl, nonPreBuilt, log, logSfy } = require("./hiddenFiles/botFunction.js");
let {print,BotUserSession,koreDebugger,moment,koreUtil,content,env,context,tags} = require('./hiddenFiles/botPreBuiltClasses');
function debug(){
    
    // THIS IS WEBSDK CODE

//this function returns all the currency fields that accounts API response returns.
function getCurrencyFields() {
    var currencyFields = ["creditLimit", "availableCredit", "cashDepositLimit", "availableCash", "maxTransactionLimit", "availableCashLimit"];
    return currencyFields;
  }
  
  // this function is to retrieve the value of custom variables which are used in content variables.
  function prepareResponse(variable, obj) {
    // koreDebugger.log(variable)
    // koreDebugger.log(JSON.stringify(obj))
    if (variable) {
      for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
        var key = Object.keys(obj)[i];
        obj[key] = typeof obj[key] === "undefined" ? "" : obj[key];
        variable = variable.split("{{" + key + "}}").join(obj[key]);
        //variable.replace("{{" + key + "}}", obj[key]);
      }
    }
    return variable;
  }
  
  //this is a list view template payload.
  function displayListV2Template(data) {
    var message = {
      type: "template",
    };
    var payload = {};
    payload.text = data.text;
    payload.template_type = "listView";
    payload.heading = data.heading;
    payload.boxShadow = data.boxShadow;
    payload.seeMore = data.seeMore;
    payload.moreCount = data.moreCount;
    if (data.seeMoreAction) payload.seeMoreAction = data.seeMoreAction;
    if (data.seeMoreTitle) payload.seeMoreTitle = data.seeMoreTitle;
    var elements = [];
  
    for (var i = 0; i < data.elements.length; i++) {
      var element = {};
      element.title = data.elements[i].title;
      if (data.elements[i].subtitle) {
        element.subtitle = data.elements[i].subtitle;
      }
      element.value = data.elements[i].value;
      if (data.elements[i].color) {
        element.color = data.elements[i].color;
      }
      if (data.elements[i].tag) {
        element.tag = data.elements[i].tag;
      }
      element.default_action = data.elements[i].isClickable ? data.elements[i].isClickable : {};
      elements.push(element);
    }
    payload.elements = elements;
    message.payload = payload;
    return message;
  }
  
  var templateSupported = ["availableCash", "purchaseLimit", "numberofTransactionsPerDay", "withdrawalTransactions", "purchaseTransactions"];
  
  if (context.entities.multipleAccounts) {
    context.customerAccounts = context.customerAccounts.filter((obj) => obj.accountNumber === context.entities.multipleAccounts);
  }
  
  // var accountLimits = context.getAccountSpecificLimits ? context.getAccountSpecificLimits.response.body : [];
  var accountLimits = context.allGetAccountSpecificLimits ?? [];
  // context.customerAccounts = [Object.assign(context.customerAccounts[0], accountLimits[0])];
  context.customerAccounts = context.customerAccounts.filter((obj) => {
    accountLimits.forEach((limitObj) => {
      if (limitObj.accountNumber == obj.displayAccountNumber || limitObj.accountNumber == obj.accountNumber) {
        Object.assign(obj, limitObj);
        return obj;
      }
    });
    return obj;
  });
  // koreDebugger.log("Con len: " +context.customerAccounts.length)
  //storing the account number on the session.
  //Not sure where it is used though.
  
  function existenceCheck(data) {
    if (data != null && data != undefined) {
      return true;
    }
    return false;
  }
  
  if (context.customerAccounts && context.customerAccounts.length === 1) {
    BotUserSession.put("accountFromCB", context.customerAccounts[0], 300);
    context.accountTypes = [context.customerAccounts[0].accountType];
  }
  
  //declaring required fields.
  var source = context.session.BotUserSession.source;
  var accountsObj = context.customerAccounts;
  var field = context.field;
  var label = context.fieldLabel;
  var elements = [],
    message,
    isTable = false,
    // This flag is used to differentiate if its a message or template. template ----> true.
    templateData = {},
    visiJointElements = [];
  var visiCount = 0;
  var data = [];
  var allAccObj = context.accountData;
  var obj = {};
  
  //Filtering all the accounts which are active.
  // accountsObj = accountsObj.filter(obj => obj.status && obj.status.toLowerCase() !== "Inactive");
  // allAccObj = allAccObj.filter(obj => obj.status && obj.status.toLowerCase() !== "Inactive");
  data = accountsObj;
  
  if (data && data.length > 1) {
    // As this is a multiple case scenario usually this flabel has the plural forms of the labels
    // content variables for plural forms are being added in accountsynonyms script.
    // Assignment of flabel is done in accountsValidation.
    //To be on safer side accField_balance is being added as fallback.
    koreDebugger.log(context.fLabel);
    context.fLabel = context.fLabel ? context.fLabel : content.accField_balance;
    userMessage = content.DiffActfields;
    for (var i = 0, len = data.length; i < len; i++) {
      var value,
        balance,
        currencyFields = getCurrencyFields();
  
      if (currencyFields.indexOf(field) > -1) {
        value = existenceCheck(data[i][field]) ? format(data[i].currency, data[i][field]) : "NA";
        // value = value && !value.startsWith("*") ? "**" + value + "**" : value;
      } else {
        value = existenceCheck(data[i][field]) ? data[i][field] : "NA";
      }
  
      // if (field === "availableCashLimit") {
      //   value = existenceCheck(data[i].availableCashLimit) ? format(data[i].currency, data[i].availableCashLimit) : "NA";
      // } else if (field === "availableCredit") {
      //   value = existenceCheck(data[i].availableCredit) ? format(data[i].currency, data[i].availableCredit) : "NA";
      // }
      // preparing data for template display.
      var element = {};
      // var accountName = field === "accountNickname" ? data[i].accountName : data[i].nicknameLabel.split("-")[0].trim();
      var accountName = field === "accountNickname" ? (data[i].displayAccountType ? data[i].displayAccountType : data[i].accountName) : data[i].nicknameLabel.split("-")[0].trim();
      if (data[i].status.toLowerCase() === "inactive") {
        // element = [accountName + " - " + maskCardNumber(data[i].accountNumber) + "( Inactive )", value];
        element.title = accountName;
        element.subtitle = maskCardNumber(data[i].accountNumber, "X") + "( Inactive )";
        element.value = value;
        element.accountNumber = data[i].accountNumber;
      } else {
        obj = {
          accountName: accountName,
          accountNumber: data[i].accountNumber,
        };
        let isClickable = {
          title: prepareResponse(content.getbal_payloadtitle, obj),
          value: prepareResponse(content.getbal_payloadtitle, obj),
          type: "postback",
          payload: prepareResponse(content.getbal_accountnumberpayload, obj),
        };
  
        element.accountNumber = data[i].accountNumber;
        //for account number should be shown in place of value.
        //for others its viceversa.
        {
          element.title = accountName;
          element.subtitle = maskCardNumber(data[i].accountNumber, "X");
          element.value = value;
        }
        element.color = "#222222";
        //preparing title,value & payload whenever a button is clicked
        //title is what is shown in UI, value is shown once the button is clicked & payload is something that goes in backend to identify the intent/entity value
        element.isClickable = isClickable;
      }
  
      // context.checkPenaltyAccount = checkPenaltyAccount;
      //As said earlier template is displayed only when the data is greater than 1.
      elements.push(element);
    }
  
    if (elements && elements.length > 1) {
      templateData.text = userMessage;
      templateData.elements = elements;
      templateData.boxShadow = true;
      message = displayListV2Template(templateData);
      isTable = true;
    } else if (elements && elements.length === 1) {
      // In template only some fields will be shown when it comes to a message some additional information will also be added.
      // The information in elements array is not sufficient to display the message.
      // filtering the data based on account number to get additional information.
      data = data.filter((obj) => obj.accountNumber === elements[0].accountNumber);
    } else {
      data = [];
    }
  
    {
      let ele = elements.filter((obj) => obj.value != null && obj.value != undefined && obj.value != "NA");
      koreDebugger.log(ele.length);
      if (ele.length == 0) {
        var message = {};
        if (!context.fieldLabel) {
          context.fieldLabel = "the required information";
        }
        message.text = content.NA_Multiple_fieldNotPresent;
      }
    }
  }
  
  if (data && data.length === 1) {
    var source = context.session.BotUserSession.source;
    var nicknameLabel = data[0].nicknameLabel.split("-")[0].trim();
    var maskAccountNumber = maskCardNumber(String(data[0].accountNumber));
    var cardNumber = data[0].cardNumber
      ? context.session.BotUserSession.isIVR
        ? maskCardNumber(String(data[0].cardNumber)).toString().split("").join(" ")
        : maskCardNumber(String(data[0].cardNumber))
      : "";
    var cardName = data[0].cardName
      ? data[0].cardName
      : data[0].accountType === "Checking Account"
      ? "Debit Card"
      : data[0].accountType === "Credit Card"
      ? data[0].accountNickname
        ? data[0].accountNickname
        : "Credit Card"
      : "";
    if (data[0].accountType !== "Credit Card") {
      if (!nicknameLabel.toLowerCase().includes("account") || !nicknameLabel.toLowerCase().includes(content.UpdateAccInfo_Account.toLowerCase())) {
        nicknameLabel = nicknameLabel + " " + content.UpdateAccInfo_Account.toLowerCase();
      }
    }
  
    // setting the default values and overriding them based on fields captured.
    placeholder = "NA";
    obj = {
      username: context.session.BotUserSession.customerName,
      label: label ? label.toLowerCase() : context.field ? context.field : "",
      accountName: nicknameLabel,
      accountNumber: maskAccountNumber,
      cardName: cardName,
      cardNumber: cardNumber,
      value: data[0][field] ? data[0][field] : placeholder,
      amount: "",
      contentVar: context.fieldContentVariable ? context.fieldContentVariable : context.field ? "showBalanceMessage" : "fieldNotFound",
      active: data[0].status && data[0].status.toLowerCase() === "inactive" ? "( " + data[0].status + ")" : "",
      fullAccountName: `${nicknameLabel} ${maskAccountNumber}`,
    };
    // context.debug = obj;
    if (obj.cardNumber) {
      var cardNumber = maskCardNumber(String(data[0].cardNumber));
      {
        obj.cardName = obj.cardName + " - " + cardNumber;
      }
    }
    var userMessage,
      elements = [],
      currencyFields = getCurrencyFields();
    // if field is related to amount then format it so that it will be $300.
    if (currencyFields.indexOf(field) > -1) {
      obj.value = existenceCheck(data[0][field]) ? format(data[0].currency, data[0][field]) : "NA";
    }
    context.fLabel = label;
    userMessage = content.DiffActfields;
  
    //"Here are your card details";
    var currency = data[0].currency;
    if (context.isLimits) {
      userMessage = context.isAccountDetails ? "" : userMessage;
      if (data[0].accountType === "Credit Card") {
        var dailyObj = Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["limits"]).length > 0 ? data[0].withdrawal["limits"] : {};
        // if (
        // context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDLMT"] ||
        // context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-ATMWITDLMT"]
        // ) {
        if (Object.keys(dailyObj["daily"]).length > 0) {
          if (dailyObj["daily"]["maximum"]) {
            elements.push({
              title: content.viewLimits_availableCash_daily,
              value: format(currency, dailyObj["daily"]["maximum"]),
              color: "#222222",
            });
          }
        }
        // }
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDLMT"]) {
        if (Object.keys(dailyObj["monthly"]).length > 0) {
          if (dailyObj["monthly"]["maximum"]) {
            elements.push({
              title: content.viewLimits_availableCash_monthly,
              value: format(currency, dailyObj["monthly"]["maximum"]),
              color: "#222222",
            });
          }
        }
        // }
        var purchaseObj = Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["limits"]).length > 0 ? data[0].purchase["limits"] : {};
        if (source !== "mashreq") {
          if (Object.keys(purchaseObj["daily"]).length > 0) {
            if (purchaseObj["daily"]["maximum"]) {
              elements.push({
                title: content.viewLimits_purchaseLimit_max_daily,
                value: format(currency, purchaseObj["daily"]["maximum"]),
                color: "#222222",
              });
            }
          }
        }
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONPURLMT"]) {
        if (Object.keys(purchaseObj["monthly"]).length > 0) {
          if (purchaseObj["monthly"]["maximum"]) {
            elements.push({
              title: content.viewLimits_purchaseLimit_max_monthly,
              value: format(currency, purchaseObj["monthly"]["maximum"]),
              color: "#222222",
            });
          }
        }
        // }
        var txnsObj = Object.keys(data[0].txnsPerDay).length > 0 ? data[0].txnsPerDay : {};
        if (txnsObj["maximum"] && source !== "mashreq") {
          elements.push({
            title: content.viewLimits_numberofTransactionsPerDay_max,
            value: txnsObj["maximum"],
            color: "#222222",
          });
        }
        if (data[0].perTxn && source !== "mashreq") {
          elements.push({
            title: content.viewLimits_pertxnlimit,
            value: data[0].perTxn,
            color: "#222222",
          });
        }
        // var withdrawTxnObj = Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["transactions"]).length > 0 ? data[0].withdrawal["transactions"] : {};
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDTXN"]) {
        //     if (Object.keys(withdrawTxnObj["daily"]).length > 0) {
        //         if (withdrawTxnObj["daily"]['maximum']) {
        //             elements.push({
        //                 title: content.viewLimits_withdrawalTransactions_max_daily,
        //                 value: withdrawTxnObj['daily']['maximum'],
        //                 color: "#222222",
        //             });
        //         }
        //     }
        // }
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDTXN"]) {
        //     if (Object.keys(withdrawTxnObj["monthly"]).length > 0) {
        //         if (withdrawTxnObj["monthly"]['maximum']) {
        //             elements.push({
        //                 title: content.content.viewLimits_withdrawalTransactions_max_monthly,
        //                 value: withdrawTxnObj["monthly"]['maximum'],
        //                 color: "#222222",
        //             });
        //         }
        //     }
        // }
        // var purchaseTxnObj = Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["transactions"]).length > 0 ? data[0].purchase["transactions"] : {};
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYPURTXN"]) {
        //     if (Object.keys(purchaseTxnObj["daily"]).length > 0) {
        //         if (purchaseTxnObj["daily"]['maximum']) {
        //             elements.push({
        //                 title: content.viewLimits_purchaseTransactions_max_daily,
        //                 value: purchaseTxnObj['daily']['maximum'],
        //                 color: "#222222",
        //             });
        //         }
        //     }
        // }
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONPURTXN"]) {
        //     if (Object.keys(purchaseTxnObj["monthly"]).length > 0) {
        //         if (purchaseTxnObj["monthly"]['maximum']) {
        //             elements.push({
        //                 title: content.viewLimits_purchaseTransactions_max_monthly,
        //                 value: purchaseTxnObj["monthly"]['maximum'],
        //                 color: "#222222",
        //             });
        //         }
        //     }
        // }
      }
      // else if (["Checking Account", "Savings Account"].includes(data[0].accountType)) {
      //     var dailyObj = Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["limits"]).length > 0 ? data[0].withdrawal["limits"] : {};
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDLMT"] || context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-ATMWITDLMT"]) {
      //         if (Object.keys(dailyObj["daily"]).length > 0) {
      //             if (dailyObj["daily"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_availableCash_daily,
      //                     value: format(currency, dailyObj['daily']['maximum']),
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["daily"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_availableCash_available_daily,
      //                     value: format(currency, dailyObj['daily']['available']),
      //                     color: "#222222",
      //                 });
      //             }
      //         }
  
      //     }
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDLMT"]) {
      //         if (Object.keys(dailyObj["monthly"]).length > 0) {
      //             if (dailyObj["monthly"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_availableCash_monthly,
      //                     value: format(currency, dailyObj["monthly"]['maximum']),
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["monthly"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_availableCash_available_monthly,
      //                     value: format(currency, dailyObj["monthly"]['available']),
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     var dailyObj = Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["limits"]).length > 0 ? data[0].purchase["limits"] : {};
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYPURLMT"]) {
      //         if (Object.keys(dailyObj["daily"]).length > 0) {
      //             if (dailyObj["daily"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseLimit_max_daily,
      //                     value: format(currency, dailyObj['daily']['maximum']),
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["daily"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseLimit_available_daily,
      //                     value: format(currency, dailyObj['daily']['available']),
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONPURLMT"]) {
      //         if (Object.keys(dailyObj["monthly"]).length > 0) {
      //             if (dailyObj["monthly"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseLimit_max_monthly,
      //                     value: format(currency, dailyObj["monthly"]['maximum']),
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["monthly"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseLimit_available_monthly,
      //                     value: format(currency, dailyObj["monthly"]['available']),
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     var dailyObj = Object.keys(data[0].txnsPerDay).length > 0 ? data[0].txnsPerDay : {};
      //     if (dailyObj['maximum']) {
      //         elements.push({
      //             title: content.viewLimits_numberofTransactionsPerDay_max,
      //             value: dailyObj['maximum'],
      //             color: "#222222",
      //         });
      //     }
      //     if (dailyObj['available']) {
      //         elements.push({
      //             title: content.viewLimits_numberofTransactionsPerDay_available,
      //             value: dailyObj['available'],
      //             color: "#222222",
      //         });
      //     }
      //     var dailyObj = Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["transactions"]).length > 0 ? data[0].withdrawal["transactions"] : {};
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDTXN"]) {
      //         if (Object.keys(dailyObj["daily"]).length > 0) {
      //             if (dailyObj["daily"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_withdrawalTransactions_max_daily,
      //                     value: dailyObj['daily']['maximum'],
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["daily"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_withdrawalTransactions_available_daily,
      //                     value: dailyObj['daily']['available'],
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDTXN"]) {
      //         if (Object.keys(dailyObj["monthly"]).length > 0) {
      //             if (dailyObj["monthly"]['maximum']) {
      //                 elements.push({
      //                     title: content.content.viewLimits_withdrawalTransactions_max_monthly,
      //                     value: dailyObj["monthly"]['maximum'],
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["monthly"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_withdrawalTransactions_available_monthly,
      //                     value: dailyObj["monthly"]['available'],
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     var dailyObj = Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["transactions"]).length > 0 ? data[0].purchase["transactions"] : {};
      //     if (context.entities.limitPeriod && context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYPURTXN"]) {
      //         if (Object.keys(dailyObj["daily"]).length > 0) {
      //             if (dailyObj["daily"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseTransactions_max_daily,
      //                     value: dailyObj['daily']['maximum'],
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["daily"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseTransactions_available_daily,
      //                     value: dailyObj['daily']['available'],
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      //     if (context.entities.limitPeriod && context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONPURTXN"]) {
      //         if (Object.keys(dailyObj["monthly"]).length > 0) {
      //             if (dailyObj["monthly"]['maximum']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseTransactions_max_monthly,
      //                     value: dailyObj["monthly"]['maximum'],
      //                     color: "#222222",
      //                 });
      //             }
      //             if (dailyObj["monthly"]['available']) {
      //                 elements.push({
      //                     title: content.viewLimits_purchaseTransactions_available_monthly,
      //                     value: dailyObj["monthly"]['available'],
      //                     color: "#222222",
      //                 });
      //             }
      //         }
      //     }
      // }
      if (elements && elements.length > 0) {
        templateData = {
          text: userMessage,
          elements: elements,
          boxShadow: true,
        };
        message = displayListV2Template(templateData);
        context.elements = elements;
        isTable = true;
      }
    } else if (field === "availableCash" && (context.traits?.includes("currentlimit") || context.entities.limitPeriod || context.entities.ATM == "ATM")) {
      var withObj = {
        Monthly: "MONWITDLMT",
        Daily: "DLYWITDLMT",
      };
      let displayAll = true;
  
      if (context.entities.limitPeriod) {
        displayAll = false;
      }
  
      if (!displayAll) {
        if (context.entities.limitPeriod || context.entities.limitPeriod === "Daily") {
          var limitPeriod = context.entities.limitPeriod.toLowerCase();
          var dailyObj =
            data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["limits"]).length > 0 && Object.keys(data[0].withdrawal["limits"][limitPeriod]).length > 0
              ? data[0].withdrawal["limits"][limitPeriod]
              : {};
          if (dailyObj["maximum"]) {
            elements.push({
              title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
              value: format(currency, dailyObj["maximum"]),
              color: "#222222",
            });
          } else {
            elements.push({
              title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
              value: "NA",
              color: "#222222",
            });
          }
  
          if (dailyObj["available"]) {
            elements.push({
              title:
                limitPeriod === "daily"
                  ? data[0].accountType === "Credit Card"
                    ? content.viewLimits_availableCash_Credit_daily
                    : content.viewLimits_availableCash_available_daily
                  : data[0].accountType === "Credit Card"
                  ? content.viewLimits_availableCash_Credit_monthly
                  : content.viewLimits_availableCash_available_monthly,
              value: format(currency, dailyObj["available"]),
              color: "#222222",
            });
          } else {
            elements.push({
              title:
                limitPeriod === "daily"
                  ? data[0].accountType === "Credit Card"
                    ? content.viewLimits_availableCash_Credit_daily
                    : content.viewLimits_availableCash_available_daily
                  : data[0].accountType === "Credit Card"
                  ? content.viewLimits_availableCash_Credit_monthly
                  : content.viewLimits_availableCash_available_monthly,
              value: "NA",
              color: "#222222",
            });
          }
        } else {
          var dailyObj =
            data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && data[0].withdrawal["limits"] && Object.keys(data[0].withdrawal["limits"]).length > 0 ? data[0].withdrawal["limits"] : {};
          // if (
          // context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDLMT"] ||
          // context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-ATMWITDLMT"]
          // ) {
          if (dailyObj["daily"] && Object.keys(dailyObj["daily"]).length > 0) {
            if (dailyObj["daily"]["maximum"]) {
              elements.push({
                title: content.viewLimits_availableCash_daily,
                value: format(currency, dailyObj["daily"]["maximum"]),
                color: "#222222",
              });
            }
            if (dailyObj["daily"]["available"]) {
              elements.push({
                title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_daily : content.viewLimits_availableCash_available_daily,
                value: format(currency, dailyObj["daily"]["available"]),
                color: "#222222",
              });
            }
          }
          // }
          // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDLMT"]) {
          if (dailyObj["monthly"] && Object.keys(dailyObj["monthly"]).length > 0) {
            if (dailyObj["monthly"]["maximum"]) {
              elements.push({
                title: content.viewLimits_availableCash_monthly,
                value: format(currency, dailyObj["monthly"]["maximum"]),
                color: "#222222",
              });
            }
            if (dailyObj["monthly"]["available"]) {
              elements.push({
                title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_monthly : content.viewLimits_availableCash_available_monthly,
                value: format(currency, dailyObj["monthly"]["available"]),
                color: "#222222",
              });
            }
          }
          // }
        }
        if (elements && elements.length > 0) {
          templateData = {
            text: userMessage,
            elements: elements,
            boxShadow: true,
          };
          message = displayListV2Template(templateData);
          context.elements = elements;
          isTable = true;
        }
      } else {
        var withObj = {
          Monthly: "MONWITDLMT",
          Daily: "DLYWITDLMT",
        };
  
        var limitPeriod = "daily";
        var dailyObj =
          data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["limits"]).length > 0 && Object.keys(data[0].withdrawal["limits"][limitPeriod]).length > 0
            ? data[0].withdrawal["limits"][limitPeriod]
            : {};
        if (dailyObj["maximum"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
            value: format(currency, dailyObj["maximum"]),
            color: "#222222",
          });
        } else {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
            value: "NA",
            color: "#222222",
          });
        }
        if (dailyObj["available"]) {
          elements.push({
            title:
              limitPeriod === "daily"
                ? data[0].accountType === "Credit Card"
                  ? content.viewLimits_availableCash_Credit_daily
                  : content.viewLimits_availableCash_available_daily
                : data[0].accountType === "Credit Card"
                ? content.viewLimits_availableCash_Credit_monthly
                : content.viewLimits_availableCash_available_monthly,
            value: format(currency, dailyObj["available"]),
            color: "#222222",
          });
        } else {
          elements.push({
            title:
              limitPeriod === "daily"
                ? data[0].accountType === "Credit Card"
                  ? content.viewLimits_availableCash_Credit_daily
                  : content.viewLimits_availableCash_available_daily
                : data[0].accountType === "Credit Card"
                ? content.viewLimits_availableCash_Credit_monthly
                : content.viewLimits_availableCash_available_monthly,
            value: "NA",
            color: "#222222",
          });
        }
  
        dailyObj =
          data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && data[0].withdrawal["limits"] && Object.keys(data[0].withdrawal["limits"]).length > 0 ? data[0].withdrawal["limits"] : {};
  
        if (dailyObj["monthly"] && Object.keys(dailyObj["monthly"]).length > 0) {
          if (dailyObj["monthly"]["maximum"]) {
            elements.push({
              title: content.viewLimits_availableCash_monthly,
              value: format(currency, dailyObj["monthly"]["maximum"]),
              color: "#222222",
            });
          }
  
          if (dailyObj["monthly"]["available"]) {
            elements.push({
              title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_monthly : content.viewLimits_availableCash_available_monthly,
              value: format(currency, dailyObj["monthly"]["available"]),
              color: "#222222",
            });
          }
        } else {
          elements.push({
            title: content.viewLimits_availableCash_monthly,
            value: "NA",
            color: "#222222",
          });
          elements.push({
            title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_monthly : content.viewLimits_availableCash_available_monthly,
            value: "NA",
            color: "#222222",
          });
        }
  
        if (elements && elements.length > 0) {
          templateData = {
            text: userMessage,
            elements: elements,
            boxShadow: true,
          };
          message = displayListV2Template(templateData);
          context.elements = elements;
          isTable = true;
        }
      }
    } else if (field === "purchaseLimit") {
      var withObj = {
        Monthly: "MONPURLMT",
        Daily: "DLYPURLMT",
      };
      if (context.entities.limitPeriod) {
        var limitPeriod = context.entities.limitPeriod.toLowerCase();
        var dailyObj = data[0]?.purchase?.limits?.[limitPeriod] || {};
  
        if (dailyObj["maximum"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_purchaseLimit_max_daily : content.viewLimits_purchaseLimit_max_monthly,
            value: format(currency, dailyObj["maximum"]),
            color: "#222222",
          });
        }
        if (dailyObj["available"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_purchaseLimit_available_daily : content.viewLimits_purchaseLimit_available_monthly,
            value: format(currency, dailyObj["available"]),
            color: "#222222",
          });
        }
      } else {
        var dailyObj = data[0]?.purchase?.limits || {};
  
        if (dailyObj["daily"] && Object.keys(dailyObj["daily"]).length > 0) {
          if (dailyObj["daily"]["maximum"]) {
            elements.push({
              title: content.viewLimits_purchaseLimit_max_daily,
              value: format(currency, dailyObj["daily"]["maximum"]),
              color: "#222222",
            });
          }
          if (dailyObj["daily"]["available"]) {
            elements.push({
              title: content.viewLimits_purchaseLimit_available_daily,
              value: format(currency, dailyObj["daily"]["available"]),
              color: "#222222",
            });
          }
        }
  
        if (dailyObj["monthly"] && Object.keys(dailyObj["monthly"]).length > 0) {
          if (dailyObj["monthly"]["maximum"]) {
            elements.push({
              title: content.viewLimits_purchaseLimit_max_monthly,
              value: format(currency, dailyObj["monthly"]["maximum"]),
              color: "#222222",
            });
          }
          if (dailyObj["monthly"]["available"]) {
            elements.push({
              title: content.viewLimits_purchaseLimit_available_monthly,
              value: format(currency, dailyObj["monthly"]["available"]),
              color: "#222222",
            });
          }
        }
      }
      if (elements && elements.length > 0) {
        templateData = {
          text: userMessage,
          elements: elements,
          boxShadow: true,
        };
        message = displayListV2Template(templateData);
        context.elements = elements;
        isTable = true;
      }
    } else if (field === "numberofTransactionsPerDay") {
      var dailyObj = Object.keys(data[0].txnsPerDay).length > 0 ? data[0].txnsPerDay : {};
      if (dailyObj["maximum"]) {
        elements.push({
          title: content.viewLimits_numberofTransactionsPerDay_max,
          value: dailyObj["maximum"],
          color: "#222222",
        });
      }
      if (dailyObj["available"]) {
        elements.push({
          title: content.viewLimits_numberofTransactionsPerDay_available,
          value: dailyObj["available"],
          color: "#222222",
        });
      }
    } else if (field === "perTransactionLimit") {
      obj.value = data[0].perTxn ? format(currency, data[0].perTxn) : "NA";
      obj.contentVar = obj.value !== "NA" ? obj.contentVar : "fieldNotFound";
    } else if (field === "withdrawalTransactions") {
      var withObj = {
        Monthly: "MONWITDTXN",
        Daily: "DLYWITDTXN",
      };
      if (context.entities.limitPeriod) {
        var limitPeriod = context.entities.limitPeriod.toLowerCase();
        var dailyObj =
          Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["transactions"]).length > 0 && Object.keys(data[0].wtihdrawal["transactions"][limitPeriod]).length > 0
            ? data[0].withdrawal["transactions"][limitPeriod]
            : {};
        if (dailyObj["maximum"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_withdrawalTransactions_max_daily : content.viewLimits_withdrawalTransactions_max_monthly,
            value: dailyObj["maximum"],
            color: "#222222",
          });
        }
        if (dailyObj["available"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_withdrawalTransactions_available_daily : content.viewLimits_withdrawalTransactions_available_monthly,
            value: dailyObj["available"],
            color: "#222222",
          });
        }
      } else {
        var dailyObj = Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["transactions"]).length > 0 ? data[0].withdrawal["transactions"] : {};
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-DLYWITDTXN"]) {
        if (Object.keys(dailyObj["daily"]).length > 0) {
          if (dailyObj["daily"]["maximum"]) {
            elements.push({
              title: content.viewLimits_withdrawalTransactions_max_daily,
              value: dailyObj["daily"]["maximum"],
              color: "#222222",
            });
          }
          if (dailyObj["daily"]["available"]) {
            elements.push({
              title: content.viewLimits_withdrawalTransactions_available_daily,
              value: dailyObj["daily"]["available"],
              color: "#222222",
            });
          }
        }
        // }
        // if (context.session.BotUserSession.fieldCodes["ACC-" + context.accountObject[data[0].accountType] + "-MONWITDTXN"]) {
        if (Object.keys(dailyObj["monthly"]).length > 0) {
          if (dailyObj["monthly"]["maximum"]) {
            elements.push({
              title: content.content.viewLimits_withdrawalTransactions_max_monthly,
              value: dailyObj["monthly"]["maximum"],
              color: "#222222",
            });
          }
          if (dailyObj["monthly"]["available"]) {
            elements.push({
              title: content.viewLimits_withdrawalTransactions_available_monthly,
              value: dailyObj["monthly"]["available"],
              color: "#222222",
            });
          }
        }
        // }
      }
      if (elements && elements.length > 0) {
        templateData = {
          text: userMessage,
          elements: elements,
          boxShadow: true,
        };
        message = displayListV2Template(templateData);
        context.elements = elements;
        isTable = true;
      }
    } else if (field === "purchaseTransactions") {
      var withObj = {
        Monthly: "MONPURTXN",
        Daily: "DLYPURTXN",
      };
      if (context.entities.limitPeriod) {
        var limitPeriod = context.entities.limitPeriod.toLowerCase();
        var dailyObj =
          Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["transactions"]).length > 0 && Object.keys(data[0].purchase["transactions"][limitPeriod]).length > 0
            ? data[0].purchase["transactions"][limitPeriod]
            : {};
        if (dailyObj["maximum"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_purchaseTransactions_max_daily : content.viewLimits_purchaseTransactions_max_monthly,
            value: dailyObj["maximum"],
            color: "#222222",
          });
        }
        if (dailyObj["available"]) {
          elements.push({
            title: limitPeriod === "daily" ? content.viewLimits_purchaseTransactions_available_daily : content.viewLimitspurchaseTransactions_available_monthly,
            value: dailyObj["available"],
            color: "#222222",
          });
        }
      } else {
        var dailyObj = Object.keys(data[0].purchase).length > 0 && Object.keys(data[0].purchase["transactions"]).length > 0 ? data[0].purchase["transactions"] : {};
  
        if (Object.keys(dailyObj["daily"]).length > 0) {
          if (dailyObj["daily"]["maximum"]) {
            elements.push({
              title: content.viewLimits_purchaseTransactions_max_daily,
              value: dailyObj["daily"]["maximum"],
              color: "#222222",
            });
          }
          if (dailyObj["daily"]["available"]) {
            elements.push({
              title: content.viewLimits_purchaseTransactions_available_daily,
              value: dailyObj["daily"]["available"],
              color: "#222222",
            });
          }
        }
  
        if (Object.keys(dailyObj["monthly"]).length > 0) {
          if (dailyObj["monthly"]["maximum"]) {
            elements.push({
              title: content.viewLimits_purchaseTransactions_max_monthly,
              value: dailyObj["monthly"]["maximum"],
              color: "#222222",
            });
          }
          if (dailyObj["monthly"]["available"]) {
            elements.push({
              title: content.viewLimits_purchaseTransactions_available_monthly,
              value: dailyObj["monthly"]["available"],
              color: "#222222",
            });
          }
        }
      }
      if (elements && elements.length > 0) {
        templateData = {
          text: userMessage,
          elements: elements,
          boxShadow: true,
        };
        message = displayListV2Template(templateData);
        context.elements = elements;
        isTable = true;
      }
    } else if (field === "availableCashLimit") {
      obj.value = existenceCheck(data[0][field]) ? format(data[0].currency, data[0][field]) : "NA";
      if (data[0].accountType.toLowerCase() !== "credit card") {
        obj.label = content.accField_withdrawllimit;
      }
      if (data[0].accountType.toLowerCase() === "credit card") {
        obj.accountNumber = obj.cardNumber;
      }
    } else if (field === "cashDepositLimit" || field === "maxTransactionLimit") {
      obj.value = existenceCheck(data[0][field]) ? format(data[0].currency, data[0][field]) : "NA";
      if (data[0].accountType.toLowerCase() === "credit card") {
        obj.accountNumber = obj.cardNumber;
      }
    } else if (field === "availableCredit") {
      obj.value = format(data[0].currency, data[0][field]);
      if (data[0].accountType.toLowerCase() !== "credit card" || data[0].accountType.toLowerCase() === "line of credit" || data[0].accountType.toLowerCase() === "home equity line") {
        obj.label = content.accField_availablecredit;
      }
      if (data[0].accountType.toLowerCase() === "credit card") {
        obj.accountNumber = obj.cardNumber;
      }
      if (data[0].accountType.toLowerCase() === "line of credit") {
        var accDet = JSON.parse(env["IA_bal"])["ACC_DTLS"];
        if (accDet["LIN"]?.enable == false || accDet?.["LIN"]?.["ADD"]?.["AVAILCRDT"] === false) {
          context.accValue = "Line of Credit";
          context.fieldValue = "Available Credit";
          message = {
            text: content.notAccessibleField,
          };
          context.unaccessible = true;
          print(JSON.stringify(message));
        }
      }
    } else if (field === "creditLimit") {
      if (data[0].accountType.toLowerCase() === "line of credit" || data[0].accountType.toLowerCase() === "home equity line") {
        obj.availableCredit = data[0].availableCredit !== null ? format(data[0].currency, data[0].availableCredit) : "NA";
        obj.contentVar = "totalCreditDisplayMsg";
        // obj.contentVar = !context.session.BotUserSession.fieldCodes["BAL-LIN-AVAILCRDT"] ? "onlytotalCreditDisplayMsg" : "totalCreditDisplayMsg";
      }
      obj.value = data[0].creditLimit !== null ? format(data[0].currency, data[0].creditLimit) : "NA";
    }
  
    // else if (context.entities.ATM == "ATM") {
    //   var withObj = {
    //     Monthly: "MONWITDLMT",
    //     Daily: "DLYWITDLMT",
    //   };
  
    //   var limitPeriod = "daily";
    //   var dailyObj =
    //     data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && Object.keys(data[0].withdrawal["limits"]).length > 0 && Object.keys(data[0].withdrawal["limits"][limitPeriod]).length > 0
    //       ? data[0].withdrawal["limits"][limitPeriod]
    //       : {};
    //   if (dailyObj["maximum"]) {
    //     elements.push({
    //       title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
    //       value: format(currency, dailyObj["maximum"]),
    //       color: "#222222",
    //     });
    //   } else {
    //     elements.push({
    //       title: limitPeriod === "daily" ? content.viewLimits_availableCash_daily : content.viewLimits_availableCash_monthly,
    //       value: "NA",
    //       color: "#222222",
    //     });
    //   }
    //   if (dailyObj["available"]) {
    //     elements.push({
    //       title:
    //         limitPeriod === "daily"
    //           ? data[0].accountType === "Credit Card"
    //             ? content.viewLimits_availableCash_Credit_daily
    //             : content.viewLimits_availableCash_available_daily
    //           : data[0].accountType === "Credit Card"
    //           ? content.viewLimits_availableCash_Credit_monthly
    //           : content.viewLimits_availableCash_available_monthly,
    //       value: format(currency, dailyObj["available"]),
    //       color: "#222222",
    //     });
    //   } else {
    //     elements.push({
    //       title:
    //         limitPeriod === "daily"
    //           ? data[0].accountType === "Credit Card"
    //             ? content.viewLimits_availableCash_Credit_daily
    //             : content.viewLimits_availableCash_available_daily
    //           : data[0].accountType === "Credit Card"
    //           ? content.viewLimits_availableCash_Credit_monthly
    //           : content.viewLimits_availableCash_available_monthly,
    //       value: "NA",
    //       color: "#222222",
    //     });
    //   }
  
    //   dailyObj =
    //     data[0]?.withdrawal && Object.keys(data[0].withdrawal).length > 0 && data[0].withdrawal["limits"] && Object.keys(data[0].withdrawal["limits"]).length > 0 ? data[0].withdrawal["limits"] : {};
  
    //   if (dailyObj["monthly"] && Object.keys(dailyObj["monthly"]).length > 0) {
    //     if (dailyObj["monthly"]["maximum"]) {
    //       elements.push({
    //         title: content.viewLimits_availableCash_monthly,
    //         value: format(currency, dailyObj["monthly"]["maximum"]),
    //         color: "#222222",
    //       });
    //     } else {
    //       elements.push({
    //         title: content.viewLimits_availableCash_monthly,
    //         value: "NA",
    //         color: "#222222",
    //       });
    //     }
  
    //     if (dailyObj["monthly"]["available"]) {
    //       elements.push({
    //         title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_monthly : content.viewLimits_availableCash_available_monthly,
    //         value: format(currency, dailyObj["monthly"]["available"]),
    //         color: "#222222",
    //       });
    //     } else {
    //       elements.push({
    //         title: data[0].accountType === "Credit Card" ? content.viewLimits_availableCash_Credit_monthly : content.viewLimits_availableCash_available_monthly,
    //         value: "NA",
    //         color: "#222222",
    //       });
    //     }
    //   }
  
    //   if (elements && elements.length > 0) {
    //     templateData = {
    //       text: userMessage,
    //       elements: elements,
    //       boxShadow: true,
    //     };
    //     message = displayListV2Template(templateData);
    //     context.elements = elements;
    //     isTable = true;
    //   }
    // }
  }
  
  if ((data && data.length === 0) || (elements && elements.length === 0 && templateSupported.includes(field)) || context.isLimits) {
    obj.contentVar = "fieldNotFound";
    if (context.field === "availableCash") {
      // koreDebugger.log("fieldNotFound");
      obj.contentVar = "showCashAdvances";
      obj.value = format(context.currency, data[0].availableCash);
    }
    //This is to handle followups for negation cases.
    context.negationCase = true;
  }
  
  // Here if its a template directly the template is printed.
  //Else retrieving the value in the content variable and printing it.
  
  if (!isTable) {
    var contentVariable = obj["contentVar"] ? content[obj["contentVar"]] : content.showBalanceMessage;
    if (!obj.value || obj.value === "NA") {
      var message = {};
      if (!context.fieldLabel) {
        context.fieldLabel = "the required information";
      }
      message.text = content.NA_fieldNotPresent;
    } else {
      message = {
        text: prepareResponse(contentVariable, obj),
      };
    }
  }
  
  if (!context.unaccessible) print(JSON.stringify(message));
  
    
}
module.exports ={debug}