const content = require('../BotVariables/content.json');
const env = require('../BotVariables/env.json');
var context = require('../context.json');
context = context.response?.updatedContext ?? context.updatedContext ?? context;
function print(val) {
    console.log(val);
}
class BotUserSession {
    context;
    constructor(context) {
        context = context
    }
    put(key, value, time) {
        context.session.BotUserSession[key] = value;
    }
    get(key) {
        return context.session.BotUserSession[key];
    }
}
class KoreUtil {
    constructor() {
    }
    _ = require('lodash');
}
class Moment {
    constructor() {
    }
    moment = require('moment');
}
class KoreDebugger {
    constructor() {
    }
    log(val) {
        console.log(val);
    }
    log(...val) {
        console.log(val.join(","));
    }
}
class Tags {
    context;
    constructor(context) {
        context = context
    }
    addMessageLevelTag(tagName,tagValue) {
        console.log(tagName,tagValue);
        // context.metaTags.MessageLevelTags.push({tagName,tagValue});
    }
    addSessionLevelTag(tagName,tagValue) {
        console.log(tagName,tagValue);
        // context.metaTags.SessionLevelTags.push({tagName,tagValue});
    }
    addUserLevelTag(tagName,tagValue) {
        console.log(tagName,tagValue);
        // context.metaTags.UserLevelTags.push({tagName,tagValue});
    }
}
module.exports = {
    print,
    BotUserSession: new BotUserSession(context),
    koreDebugger: new KoreDebugger(),
    momemt: new Moment(),
    koreUtil: new KoreUtil(),
    context,
    content,
    env,
    tags:new Tags()
}
