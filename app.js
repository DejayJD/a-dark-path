let newTerminalLine = "";
const newLine = "\n";
const cursorSpans = "<span id='user-input'></span>";
const serverUrl = "http://localhost:3000";
let executing = false;
let hideUserInput = false;
var typewriter;
userInputAllowed = false;
let currentDirectory = "/";
let commandLog = [];
let commandCursor = 0;
let promptingInput = false;


function executeTypewriter(sequence, enableUserInputCallback = true, newLine = false) {
    disableUserInput();
    if (enableUserInputCallback || newLine) {
        sequence[sequence.length - 1].callback = newLine ? enableUserInputAndMakeNewLine : enableUserInput;
    }
    typewriter.playSequence(sequence);
}


$(function () {
    String.prototype.replaceAt = function (index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    };
    typewriter = new Typewriter($("#terminal"));
    typewriter.setCaret("_");
    typewriter.setCaretPeriod(500);
    typewriter.setDelay(80, 60);
    initialSequence();

});

async function initialSequence() {
    let res = await $.ajax({
        url: serverUrl + "/initial-sequence",
        withCredentials: true,
        type: "GET", headers: {
            'Access-Control-Allow-Origin': '*'
        },
        async:true,
        crossDomain: true,
    });
    let initialSequenceMessages = res.sequence;
    newTerminalLine = res.terminalLine + currentDirectory.replace(/\./g, '') + " ";
    let index = initialSequenceMessages.length - 1;
    let newSequenceItem = initialSequenceMessages[index];
    newSequenceItem.callback = initializeConsoleTyping;
    initialSequenceMessages[index] = newSequenceItem;
    executeTypewriter(initialSequenceMessages, false);
}

async function initializeConsoleTyping() {
    enableUserInput();
    let cursor = $('#cursor');
    cursor.before(cursorSpans);
    $(document).keypress(async function (e) {
        if (userInputAllowed) {
            let key = e.originalEvent.key;
            //ENTER
            if (e.originalEvent.key == "Enter") {
                let userInput = $("#user-input");
                let currentText = userInput.text();
                userInput.empty();
                sendToConsole(currentText);

                if (!executing) {
                    commandLog.push(currentText);
                    commandCursor = commandLog.length;
                    await generateConsoleOutput(currentText);
                }
                key = "";
            }
            //NORMAL KEYS
            if (!hideUserInput) {
                sendToUserInput(key);
            }
        }
    });

    //BACKSPACE & ARROW KEYS
    $('html').keydown(function (e) {
        if (userInputAllowed && !executing) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
                if (e.keyCode == 38) {
                    if (commandCursor > 0) {
                        commandCursor -= 1;
                    }
                }
                if (e.keyCode == 40) {
                    if (commandCursor < commandLog.length) {
                        commandCursor += 1;
                    }
                }
                emptyUserInput();
                sendToUserInput(commandLog[commandCursor]);
            }
            if (e.keyCode == 8 && !executing) {
                let currentText = $('#user-input').text();
                let newText = currentText.substring(0, currentText.length - 1);
                $("#user-input").html(newText);
            }
        }
    });
}

function scrollToBottom() {
    $('#terminal').animate({
        scrollTop: $('#terminal')[0].scrollHeight
    }, 0);
}

function startNewUserLine() {
    sendToConsole(newLine + newTerminalLine);
    scrollToBottom();
}

function emptyUserInput() {
    $('#user-input').empty();
}

function sendToUserInput(input) {
    $('#user-input').append(input);
}

function sendToConsole(input, startNewLine = false, endNewLine = false) {
    let text = (startNewLine ? "\n" : "") + input + (endNewLine ? "\n" : "");
    let newSequence = [
        {
            text: text,
            instant: true
        }
    ];
    typewriter.playSequence(newSequence);
    // $('#user-input').before(text);
}

function enableUserInput() {
    userInputAllowed = true;
}

function enableUserInputAndMakeNewLine(sequence) {
    enableUserInput();
    startNewUserLine();
}

function disableUserInput() {
    userInputAllowed = false;
}

async function awaitUserInput() {
    promptingInput = true;
    await timeout(500);
    let userHasEntered = false;
    let input = "";
    $(document).keydown(async function (e) {
        if (promptingInput) {
            let key = e.originalEvent.key;
            if (key == "Enter") {
                userHasEntered = true;
            }
            else if (key == "Backspace") {
                input = input.substring(0, input.length - 1);
                $("#user-input").html(input);
            }
            else if (key == "Shift") {
            }
            else {
                input += key;
            }
        }
    });
    while (!userHasEntered) {
        await timeout(250);
    }
    return input;
}

async function generateConsoleOutput(input) {
    if (input != null) {
        executing = true;
        let parsed = input.split(' ');
        let command = parsed[0];
        let params = [];
        params = parsed.slice(1, parsed.length);
        // if (command.match(/.\//) != null) {
        //     let parsed = input.split(/(.\/)(.*)/);
        //     command = parsed[1];
        //     params = parsed[2];
        // }
        let requestBody = {
            command: command,
            params: params,
            cwd: currentDirectory
        };
        let output = '';
        if (command != '') {
            try {
                output = await $.post(serverUrl + "/execute-command", requestBody);
            }
            catch (e) {
                sendErrorResponse();
                return;
            }
            if (output.type == "prompt") {
                while (output.type == "prompt") {
                    sendToConsole(output.message, true);
                    hideUserInput = output.hidden;
                    let input = await awaitUserInput();
                    scrollToBottom();
                    hideUserInput = false;
                    requestBody.userInput = input;
                    output = await $.post(serverUrl + "/execute-command", requestBody);
                }
            }

            if (output.type == "sequence") {
                executeTypewriter(output.message, false, true);
            }
            else if (output.type == "hackerman") {
                if (output.preMessage != null) {
                    sendToConsole(output.preMessage, true);
                }
                await hackermanScript(output.message);
                if (output.postMessage != null) {
                    sendToConsole(output.postMessage, true);
                }
                startNewUserLine();
            }
            else if (output.type == "terminal-change") {
                if (output.newDirectory) {
                    currentDirectory = output.newDirectory;
                    newTerminalLine = newTerminalLine.replace(/\/.*/, '') + currentDirectory.replace(/\./g, '') + " ";
                }
                if (output.server && output.user) {
                    newTerminalLine = output.user + "@" + output.server + "~$ " + currentDirectory + " ";
                }
                startNewUserLine();
            }
            else {
                sendToConsole(output.message, true);
                startNewUserLine();
            }
        }
        else {
            startNewUserLine();
        }
        executing = false;
    }
}

function sendErrorResponse() {
    sendToConsole("Congrats, you found a bug and broke the server. \nYour QA testing skills have improved. \nQASkills         + 1\nQASkills Level    27\nOverall Level     64\n", true);
    startNewUserLine();
    enableUserInput();
    executing = false;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function hackermanScript(text) {
    sendToConsole('', true);
    $('#user-input').append("<span id='hacker-man'></span>");
    let existingIndices = [];
    let actualText = text;
    let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
    while (existingIndices.length < actualText.length) {
        let randomIndex = Math.floor(Math.random() * text.length);
        while (existingIndices.includes(randomIndex)) {
            randomIndex = Math.floor(Math.random() * text.length);
        }
        text.split('').forEach(async (letter, i) => {
            let randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            let newChar = i != randomIndex ? randomChar : actualText[i];
            if (!existingIndices.includes(i)) {
                text = text.replaceAt(i, newChar);
            }
            $('#hacker-man').html(text);
            await timeout(25);
        });
        existingIndices.push(randomIndex);
        await timeout(100);
    }
    sendToConsole($('#hacker-man').text());
    $('#hacker-man').remove();
    return;
}
