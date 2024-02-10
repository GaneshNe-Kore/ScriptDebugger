let config = require('../config.json');
var axios = require('axios');
var jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
let bot = config.env.developer;
let host = bot.host;
let secret = bot.secreatKey;
let botID = bot.streamID;
let appId = bot.clientId;
let version = bot.version;
function wToFile(fileName, data) {
    const directory = './BotVariables';
    const filePath = path.join(directory, fileName);

    // Check if the directory exists, if not create it
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    let date = new Date();
    fileName = filePath ?? `default-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.json`
    fs.writeFileSync(fileName, JSON.stringify(data));
}
function generateCsv(data) {
    return data.map(variable => `${variable.key},${variable.value},${variable.group},${variable.isSecured}`).join('\n');
}
async function getToken(appId, secretKey,sub = "123456789") {
    var payload = {
        sub,
        appId
    };
    var options = {
        expiresIn: '5m', // Token expiration time,
        header: {
            alg: "HS256",
            type: "JWT"
        }
    };
    // Secret key used to sign the token
    var secretKey = secretKey;
    // console.log("object");
    try {
        return await jwt.sign(payload, secretKey, options);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.log('Server responded with status code:', error.response.status);
            console.log('Response data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.log('Error setting up the request:', error.message);
        }
        console.log('Error config:', error.config);
    }
}
async function fetchBotVariables(host, version = "1.1", botID, secretKey) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://${host}/api/${version}/public/builder/stream/${botID}/variables/export`,
            headers: {
                'auth': `${secretKey}`,
                'Content-Type': 'application/json'
            },
            data: {} // You can pass any data here if required
        };
        var response = await axios.request(config);
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.log('Server responded with status code:', error.response.status);
            console.log('Response data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.log('Error setting up the request:', error.message);
        }
        console.log('Error config:', error.config);
    }
}
function downloadBotVariables(botVariables) {
    const defaultOptions = {
        createFile: true,
        fileType: "json",
        fileName: "botVar",
        variableType: "",
        group: "",
        lang: "en",
        isSecured: false,
        meta: [""]
    };
    const { createFile, fileType, fileName, variableType, group, lang, isSecured } = defaultOptions;
    var env = {};
    var content = {};
    var contentVariables = [];
    var envVariables = [];
    var groupVariables = {
        env:[],
        content:[]
    };
    var securedVariables = {
        env:[],
        content:[]
    };
    const processVariable = (variable) => {
        if (variable.variableType === "locale") {
            contentVariables.push({
                key: variable.key,
                value: variable.localeData[lang].value,
                group: variable.group,
            });

            content[variable.key] = variable.localeData[lang].value;
        }
        if (variable.variableType === "env") {
            envVariables.push({
                key: variable.key,
                value: variable.value,
                group: variable.group,
                isSecured: variable.isSecured,
            });
            env[variable.key] = variable.value;
        }
    }
    const botVars = botVariables;
    botVars.forEach(processVariable);
    if (group) {
        groupVariables.env = envVariables.filter(value => value.group === group);
        groupVariables.content = contentVariables.filter(value => value.group === group);
    }
    if (isSecured) {
        securedVariables.env = envVariables.filter(value => value.isSecured);
        securedVariables.content = contentVariables.filter(value => value.isSecured);
    }
    if (createFile) {
        wToFile("env.json", env);
        wToFile("content.json", content);
        if (fileType === "csv") {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.csv`, generateCsv(contentVariables));
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.csv`, generateCsv(envVariables));
        } 
        else {
            wToFile(`${fileName ? fileName + "CNT" : "contentVariables"}${lang.toUpperCase()}.json`, contentVariables);
            wToFile(`${fileName ? fileName + "ENV" : "envVariables"}.json`, envVariables);
        }
    }
    if(isSecured){
        fileType === "csv" ? wToFile(`securedVar.csv`, generateCsv(securedVariables)) : wToFile(`securedVar.json`, JSON.stringify(securedVariables));
    }
    if(group){
        fileType === "csv" ? wToFile(`groupedVar.csv`, generateCsv(securedVariables)) : wToFile(`groupedVar.json`, JSON.stringify(securedVariables));
    }

    return [content, env];
}
async function getBotVariables() {
    var secretKey = await getToken(appId, secret);
    // console.log(tok);
    let data = await fetchBotVariables(host, version, botID, secretKey);
    // console.log(data);
    return downloadBotVariables(data);
}
module.exports = getBotVariables;