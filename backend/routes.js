/*
 *  Created By JD.Francis on 5/29/18
 */
let express = require('express');
let router = express.Router();
let config = require('./config.js');
let progress = require('./progress.js');
var cors = require('cors');
const newLine = "\n";
const fs = require('fs');
const logger = require('./logger');
const _ = require('lodash');
const aesWords = require('./aesWords');

const commands = {
    help: {callback: showHelp},
    "./": {callback: executeScript},
    cd: {callback: changeDirectory},
    ssh: {callback: ssh},
    su: {callback: changeToRootMode},
    sudo: {callback: displayRootModeInfo},
    ls: {callback: listFiles},
    touch: {callback: createFile},
    quit: {callback: changeToLocalHost},
    open: {callback: executeApp},
    //EASTER EGGS
    mkdir: {callback: operationNotAllowed},
    rmdir: {callback: operationNotAllowed},
    cp: {callback: operationNotAllowed},
    mv: {callback: operationNotAllowed},
    rm: {callback: operationNotAllowed},
    more: {callback: operationNotAllowed},
    lpr: {callback: operationNotAllowed},
    man: {callback: operationNotAllowed},
    grep: {callback: operationNotAllowed},
    chmod: {callback: operationNotAllowed},
    kill: {callback: operationNotAllowed},
    gzip: {callback: operationNotAllowed},
    mail: {callback: operationNotAllowed},
    telnet: {callback: operationNotAllowed},
    ftp: {callback: operationNotAllowed},
    vim: {callback: operationNotAllowed},
};
const directory = {
    "localhost": {
        "/": {
            "bin/": {},
            "etc/": {},
            "lib/": {},
            "clueFiles/": {
                "hidden-folder/": {
                    "hidden-folder2/": {
                        "hidden-folder3/": {
                            "hidden-folder4/": {
                                "hidden-folder5/": {
                                    "hidden-folder6/": {
                                        "hidden-folder7/": {
                                            "hidden-folder8/": {
                                                "hidden-folder9/": {
                                                    "hidden-folder10/": {
                                                        "hiddenFolder11/": {
                                                            "hiddenFolder12/": {
                                                                "hiddenFolder13/": {
                                                                    "hiddenFolder14/": {
                                                                        "hiddenFolder15/": {
                                                                            "hiddenFolder16/": {
                                                                                "hiddenFolder17/": {
                                                                                    "hiddenFolder18/": {
                                                                                        "hiddenFolder19/": {
                                                                                            "hiddenFolder20/": {
                                                                                                "Wow-I-didnt-think-you-would-get-this-far/": {
                                                                                                    "Theres-really-nothing-down-here-you-should–turn-around-now/": {
                                                                                                        "Points-for-persistence-but–im-telling-you-theres-really-nothing-in-here/": {
                                                                                                            "Well-you-cant-say-I-didnt-warn-you/": {
                                                                                                                "Congratulations. Theres nothing here.": {}
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "agile-training.cfile": {scriptOutput: config.githashlink},
                "new-clue.cfile": {touch: true, hidden: true, scriptOutput: generateAESWord},
            },
            "clue-generator.sh": {callback: generateClue},
            "run/": {},
            "root/": {},
            "speedup-initial-message.sh": {callback: speedupInitialMessage},
            "sys/": {},
            "usr/": {},
            "hack-joshs-favorite-playlist.sh": {callback: sendToSpotify, root: true},
            "tmp/": {},
            "var/": {},
            "paperclips/": {
                "paperclip.app": {callback: paperclipApp},
                "paperclip-output/": {
                    "limerick.cfile": {limerick:true, hidden: config.limerickHidden, scriptOutput: limerick},
                    "paperclip.cfile": {paperclip:true, hidden:config.paperclipHidden, scriptOutput: paperclipClue}
                },
            },
            "security/": {
                "decrypter.sh": {callback: decrypt},
            },
        }
    },
    "11.203.25.105": {
        "/": {
            "clue-generator.sh": {callback: generateClue},
            "a-dark-path.cfile": {scriptOutput: outputRepo}
        }
    }
};

var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.send(200);
    }
    else {
        next();
    }
};

router.use(allowCrossDomain);

router.get('/initial-sequence', cors(), function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    let sequence = [
        {
            text: config.user + "@" + config.server + "~$ ",
            instant: true
        },
        {
            text: `If you are reading this, then I am already ${ config.instantMessages ? "on vacation" : "dead"}......`,
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 1000 : 0
        },
        {
            text: config.instantMessages ? "" : "\b\b\b\b\b\b\b\b\b\bon vacation...",
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 1000 : 0
        },
        {
            text: newLine + config.user + "@" + config.server + "~$ ",
            instant: true
        },
        {
            text: "I have prepared a little challenge for you, should you choose to accept it.",
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 1000 : 0
        },
        {
            text: newLine + config.user + "@" + config.server + "~$ ",
            instant: true
        },
        {
            text: "In order to succeed, pay close attention to every detail.",
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 1000 : 0
        },
        {
            text: newLine + config.user + "@" + config.server + "~$ ",
            instant: true
        },
        {
            text: "Beware, however, that this will send you off on a dark path, perhaps never to return......",
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 3000 : 0
        },
        {
            text: "\n\n-- MESSAGE COMPLETE --",
            instant: true,
        },
        {
            text: "\n'If ye approacheth the bridge of slack, ye must ask of me only questions 3.'",
            instant: config.instantMessages,
            delayAfter: !config.instantMessages ? 3000 : 0
        },
        {
            text: `\n-- SLACK CLUES REMAINING: ${config.cluesRemaining} --`,
            instant: true,
        },
        {
            text: newLine + config.user + "@" + config.server + "~$ ",
            instant: true
        }
    ];
    if (config.rootModeEnabled) {
        sequence.splice(sequence.length - 1, 0, {
            text: "\n-- ROOT MODE HAS BEEN ENABLED --\n",
            instant: true,
        });
    }
    res.status(200).send({sequence: sequence, terminalLine: config.user + "@" + config.server + "~$ "});
});
router.post('/execute-command', async function (req, res) {
    let output = "";
    req.body['command'] = req.body['command'].trim();
    if (req.body['command'].toString().startsWith('./')) {
        let parsed = req.body['command'].split(/(.\/)(.*)/);
        req.body['command'] = parsed[1];
        req.body['params'] = parsed[2].split(' ').concat(req.body.params);
    }
    if (commands[req.body['command']] == null) {
        output = " -console: unknown command " + req.body['command'];
    }
    else {
        try {
            output = await commands[req.body['command']].callback(req.body['params'], req.body['cwd'], req.body['userInput']);
        }
        catch (e) {
            logger.error(e);
            res.status(500).send();
        }
    }
    if (typeof output === "string" && output != null) {
        output = {message: output};
    }
    res.status(200).send(output);
});
router.get('/root-mode-enabled', async function (req, res) {
    config.rootModeEnabled = true;
    writeToFile('config');
    res.status(200).send();
});
router.get('/use-clue', async function (req, res) {
    progress.cluesRemaining -= 1;
    writeToFile('config');
    res.status(200).send();
});

/*
    Helper Functions
 */
function writeToFile(file) {
    let data = config;
    if (file == "progress") {
        data = progress;
    }
    let newConfigData = `let ${file} = ${JSON.stringify(data)};\nmodule.exports = ${file};`;
    newConfigData = newConfigData.replace(/,/g, ",\n\t");
    newConfigData = newConfigData.replace(/{/, "{\n\t");
    newConfigData = newConfigData.replace(/}/, "\n}");
    fs.writeFile(`./${file}.js`, newConfigData, function (err) {
        if (err) {
            logger.error(err);
            return err;
        }
    });
}

function generateClue(params, cwd) {
    if (params.length > 0) {
        let filePath = (cwd + params[1]).replace(/\/\./, '/');
        filePath = filePath.replace(/\//g, '/.');
        if (params[1].endsWith('.cfile')) {
            let file = getFile(filePath);
            if (file != null) {
                let scriptOutput = file.scriptOutput;
                if (typeof file.scriptOutput == "function") {
                    scriptOutput = file.scriptOutput();
                }
                return {message: scriptOutput, type: 'hackerman'};
            }
            else {
                return `-console: ./${params[1]}: No such file or directory`;
            }
        }
        else {
            return {message: 'incorrect file type\nusage: generate-clue.sh [cfile]'}
        }
    }
    else {
        return {message: 'usage:\ngenerate-clue.sh [cfile]'}
    }
}

function executeFileType(arguments, cwd, filetype, input) {
    let currentDirectory = getCurrentDirectory(cwd);
    // let params = arguments.slice(1, arguments.length);
    let file = arguments[0];
    let output = "Executing : " + file;
    if (currentDirectory[file] == null) {
        return `-console: ./${file}: No such file or directory`;
    }
    else {
        if (!file.endsWith(filetype)) {
            return `-console: Incorrect file type ${file}. Must end with ${filetype}`;
        }
        else {
            if (currentDirectory[file].root && config.user != "root") {
                return `-console: ./${file}: Permission Denied.`;
            }
            output = currentDirectory[file].callback(arguments, cwd, input);
        }

    }
    return output;
}

function executeScript(script, cwd, input) {
    return executeFileType(script, cwd, ".sh", input);
}

function executeApp(app, cwd, input) {
    return executeFileType(app, cwd, '.app', input);
}

function decrypt(params, cwd) {
    let encryptionTypes = [
        'triple-des', 'rsa', 'des', 'blowfish', 'twofish', '3des', 'rc2', 'rc4', 'aes'
    ];
    let inputEncryptionType = params[1];
    let inputString = params[2];
    let inputPasskey = params[3];
    if (params.length < 4) {
        return `usage:\ndecrypt.sh [encryption-type] [input-string|hash] [input-key]
Possible encryption values: triple-des, rsa, des, blowfish, aes, twofish, 3des, rc2, rc4`
    }
    else {
        let test = encryptionTypes.find((e)=>{return e==inputEncryptionType});
        if (!encryptionTypes.find((e)=>{return e==inputEncryptionType})) {
            return `Unknown encryption type: ${inputEncryptionType}`
        }
        else {
            if (inputEncryptionType == "aes" && inputString == config.AESHash && inputPasskey == config.AESPassword) {
                progress.aesSSHAddressFound = true;
                writeToFile("progress");
                return `\n    Output: \n    =======\n    ${config.sshAddresss}\n`
            }
            else {
                return `\n    Output: \n    =======\n    ${makeHash(64)}\n\nHmm, that combination didnt seem to work...\n`
            }
        }
    }
    return "Err... you seem to have found an edge case that JD didnt program for... \nIn order to resolve this issue, don't do that next time...";
}

function makeHash(length) { //MMMmmmm hash.... Delicious.
    var text = "";
    var possible = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!@#$%^&*()_+=-[]{}\|'";:.>,</?`;

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const paperclipStore = {
    'limerick.cfile': {price: 1000, callback: showLimerickFile},
    'paperclip.cfile': {price: 50000, callback: showPaperclipFile}
};

function paperclipApp(params, cwd, input) {
    let currentDate = new Date();
    let output = null;
    if (input != null) {
        try {
            if (config.miningStarted != null && config.miningEnabled) {
                let timeElapsed = currentDate.getTime() - new Date(config.miningStarted).getTime();
                config.currentMiningCycle = timeElapsed / config.miningSpeed
            }
            config.paperclipsMined = config.currentMiningCycle + config.previousMiningCycles - config.paperclipsSpent;
            if (!progress.minerOpened) {
                progress.minerOpened = true;
            }
            if (input == "view") {
                output = {type: 'prompt', message: `Current amount: ${Math.floor(config.paperclipsMined)}\n > `};
            }
            else if (input == "store") {
                return {
                    type: 'prompt', message: `    
    =========
    - STORE -
    =========
    - limerick.cfile         : 1,000 paperclips
    - paperclip.cfile        : 50,000 paperclips
    - hypnodrone             : 70,000 paperclips\n > `
                };
            }
            else if (input.trim().startsWith("buy")) {
                let itemInput = input.split("buy")[1].trim();
                let storeItem = paperclipStore[itemInput];
                if (storeItem != null) {
                    if (storeItem.price < config.paperclipsMined) {
                        if (paperclipStore[itemInput].callback()) {
                            config.paperclipsSpent += storeItem.price;
                            output = {type: 'prompt', message: `Buying ${itemInput}... Something has happened...\n > `};
                        }
                        else {
                            output = {type: 'prompt', message: `There was an issue trying to buy ${itemInput}...\n > `};
                        }
                    }
                    else {
                        output = {type: 'prompt', message: `Not enough to buy ${itemInput}\n > `};
                    }
                }
                else {
                    output = {type: 'prompt', message: `Couldnt find item ${itemInput}\n > `};
                }
            }
            else if (input == "quit") {
                output = "Exiting PaperClipCoin Miner App";
            }
            else if (input == "disable") {
                config.miningEnabled = false;
                config.previousMiningCycles += config.currentMiningCycle;
                config.currentMiningCycle = 0;
                output = {type: 'prompt', message: "Autoclippers disabled\n > "};
            }
            else if (input == "make") {
                config.paperclipsMined += 1;
                output = {
                    type: 'prompt',
                    message: `Made a paperclip. Current count: ${Math.floor(config.paperclipsMined)}\n > `
                };
            }
            else if (input == "enable") {
                if (!config.miningEnabled) {
                    config.miningEnabled = true;
                    config.miningStarted = currentDate;
                    output = {type: 'prompt', message: "Autoclippers enabled\n > "};
                }
                else {
                    output = {type: 'prompt', message: "Autoclippers already enabled\n > "};
                }
            }
            else {
                output = {type: 'prompt', message: ' > '};
            }
        }
        catch (e) {
            logger.error(e);
            output = {type: 'prompt', message: 'There was an error... \n> '};

        }
    }
    else
    {
        output = {
            type: 'prompt', message: `
    ====================================
    - Welcome to Universal Paperclips! -
    - version: 1.03.4                  -
    ====================================
    Clipper Status       : ${config.miningEnabled ? "Actively generating" : "Inactive"}
    Paperclips           : ${Math.floor(config.paperclipsMined)}
    Current paperclips/s : ${1000 / config.miningSpeed} paperclips/s
    Marketing Level      : 4
    Public Demand        : 384 %
    AutoClippers         : 48
    MegaClippers         : 12
    =============================
    COMMANDS
    - view        : displays current amount of paperclips
    - store       : display what you can spend your paperclips on
    - make        : makes a paperclip
    - buy [item]  : buys [item], if you have enough paperclips
    - enable      : enables your clippers
    - disable     : disables your clippers
    - quit        : exit out of the app
 > `
        };
    }
    writeToFile("config");
    writeToFile('progress');
    return output;
}

/*
    Callback Functions
 */
function generateAESWord() {
    let aWord = Math.floor(Math.random() * (aesWords.a.length - 1));
    let eWord = Math.floor(Math.random() * (aesWords.e.length - 1));
    let sWord = Math.floor(Math.random() * (aesWords.s.length - 1));
    return `Password: ${config.AESPassword}\n${aesWords.a[aWord]} ${aesWords.e[eWord]} ${aesWords.s[sWord]}`;
}

function speedupInitialMessage() {
    let randomDelay = Math.floor(Math.random() * 2500) + 1000;
    let sequence = [
        {
            text: "\nExecuting Script\n",
            instant: true,
        },
        {
            text: "...................",
            delayAfter: randomDelay
        },
        {
            text: "\nProgram has finished execution.\nO Errors. 3 Warnings. \nYou may notice something different the next time you visit the site",
            instant: true
        }
    ];
    logger.info("speeding up initial message");
    config.instantMessages = !config.instantMessages;
    writeToFile('config');
    return {message: sequence, type: "sequence"};
}

function changeDirectory(input, cwd) {
    let output = "";
    let newDirectory = input[0];
    if (newDirectory.match(/\/$/) != null) {
        newDirectory = newDirectory.substring(0, newDirectory.length - 1);
    }
    newDirectory = newDirectory.replace(/([^\/])(\/)/g, "$1/.");
    newDirectory = newDirectory + "/";
    if (newDirectory[0] == "/") { //absolute-path

    }
    else { //relative path
        let currentDirectory = null;
        try {
            currentDirectory = getCurrentDirectory(cwd);
        }
        catch (e) {
            logger.error(e);
            logger.error("unable to find directory :" + cwd);
            return '';
        }
        if (newDirectory.match(/\.\.\//) != null) {
            if (cwd == "/") {
                output = "You are already at the highest directory";
            }
            else {
                newDirectory = cwd.replace(/\.(?!.*\.).*/, '');
                output = {
                    message: 'directory changed to ' + newDirectory,
                    newDirectory: newDirectory,
                    type: 'terminal-change'
                }
            }
        }
        else {
            if (_.get(currentDirectory, newDirectory) == null) {
                output = `-console: cd: ${newDirectory}: No such file or directory`;
            }
            else {
                output = {
                    message: 'directory changed to ' + newDirectory,
                    newDirectory: cwd + '.' + newDirectory,
                    type: 'terminal-change'
                }
            }
        }
    }

    return output;
}

function displayRootModeInfo(script) {
    if (config.user != "root") {
        return `sudo: Permission Denied.\nOnly user=root has access to use sudo. Switch to root user to execute this file.`;
    }
    else {
        script[0] = script[0].replace('./', '');
        return executeScript(script);
    }
}

function changeToRootMode(params, cwd, password) {
    if (!config.rootModeEnabled) {
        return "-console: root mode is not enabled yet";
    }
    else {
        if (password == null) {
            return {type: 'prompt', message: 'password: ', hidden: true}
        }
        else {
            if (password == config.correctRootPassword) {
                config.user = "root";
                progress.userChanged = true;
                writeToFile('config');
                writeToFile('progress');
                return {type: "terminal-change", user: config.user, server: config.server, message: ""}
            }
            else {
                let message = "-console: ERROR - incorrect password";
                if (progress.badRootPasswordAttempts > 10) {
                    message += "\nSomething about this server seems familiar... \nMaybe it has the same root password as another server?"
                }
                if (progress.badRootPasswordAttempts > 30) {
                    message += "\nPerhaps it has the same password as another server at an electric delivery company.."
                }
                progress.badRootPasswordAttempts += 1;
                writeToFile("progress");
                return message;
            }
        }
    }
}

function ssh(input) {
    let address = input[0];
    let user = 'usr-dark-path';
    if (address.match('@') != null) {
        let parsed = address.split("@");
        address = parsed[1];
        user = parsed[0];
    }
    if (address == config.sshAddresss) {
        progress.serverChanged = true;
        config.user = user;
        config.server = config.sshAddresss;
        writeToFile('progress');
        writeToFile('config');
        return {message: "", type: "terminal-change", user: config.user, server: config.server, newDirectory:"/"};
    }
    else {
        return "Invalid IP Address. Try a different one.";
    }
}

function changeToLocalHost() {
    if (config.server == config.sshAddresss) {
        if (config.server != 'localhost') {
            config.user = 'usr-dark-path'
        }
        config.server = 'localhost';
        writeToFile('config');
    }
    return {type: "terminal-change", server: config.server, user: config.user, newDirectory:'/'};
}

function createFile(input, cwd) {
    if (showHiddenFiles("touch", cwd)) {
        progress.touchClueCreated = true;
        writeToFile('progress');
        return "New file created";
    }
    else {
        return "touch failed. Incorrect directory. Try a different directory.";
    }
}

function getCurrentDirectory(cwd) {
    return _.get(directory[config.server], cwd);
}

function getFile(filePath) {
    filePath = filePath.split('/.');
    filePath = _.map(filePath, (path, i) => {
        if (i != filePath.length - 1) {
            path = path + "/"
        }
        return path;
    });
    return _.get(directory[config.server], filePath);
}

function listFiles(params, cwd) {
    let fileList = "";
    let currentDirectory = getCurrentDirectory(cwd);
    for (let file in currentDirectory) {
        if (!currentDirectory[file].hidden) {
            fileList += file + "  ";
        }
    }
    return fileList;
}

function sendToSpotify() {
    progress.spotifyLinkHacked = true;
    writeToFile('progress');
    return {message: config.playlistLink, type: 'hackerman'};
}

function showHelp() {
    let sequence = [
        {
            text: "\nyou cannot be helped....",
            instant: true,
            delayAfter: 3000
        },
        {
            text: "\nOnly kidding... \nTry using some UNIX commands and see what happens\n",
            instant: true
        },
        {
            text: "\nAlso there is a bug with input on the paperclip.app that the lazy dev didn't have time to fix (he wasn't agile enough I guess).\nI recommend refreshing after each time you open it (sorry)",
            instant: true
        }
    ];
    return {message: sequence, type: 'sequence'};
}

function operationNotAllowed() {
    return "ERROR - operation not allowed. \nKudos for trying this one, but JD didn't program this one in."
}

function showLimerickFile() {
    config.limerickHidden = false;
    return showHiddenFiles('limerick', config.paperclipOutputDir);
}

function showPaperclipFile() {
    config.paperclipHidden = false;
    return showHiddenFiles('paperclip', config.paperclipOutputDir);
}

function showHiddenFiles(fileType, currentDirectory) {
    let filesMade = false;
    currentDirectory = getCurrentDirectory(currentDirectory);
    if (currentDirectory != null) {
        _.map(currentDirectory, (file) => {
            if (file[fileType]) {
                file.hidden = false;
                filesMade = true;
            }
        });
    }
    return filesMade;
}

function limerick() {
    return `
    There was an AI made of dust,
    Whose poetry gained it man's trust, 
    If is follows ought,
    It'll do what they thought 
    In the end we all do what we must.
    `
}

function paperclipClue() {
    return `
    While the panther may call the jungle his home,
    This particular black cat spends his time visiting a foreign land
    Examining the felines den may yield great rewards.
    `
}

function outputRepo() {
    progress.githubRepoFound = true;
    return "https://github.com/DejayJD/a-dark-path";
}
module.exports = router;