const winston = require('winston');
const _ = require('lodash');

const logFormat = winston.format.printf((info) => {
    let dataProvided =
        Object.assign({}, info, {
            level: undefined,
            message: undefined,
            timestamp: undefined
        });
    let dataHasBeenProvided = Object.keys(dataProvided).length > 3;
    let data = dataHasBeenProvided ? JSON.stringify(dataProvided) : '';
    return `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message} ${data}`;
});

const fileSizeOptions = {
    maxsize: '1'
};

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports: [
        new winston.transports.Console({colorize: true, prettyPrint: true}),
        new winston.transports.File({filename: 'log/error.log', level: 'error'}), //Errors file
    ]
});

module.exports = logger;