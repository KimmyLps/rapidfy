// request-logger.js

'use strict';

var Logger = require('./logger');
var path = require('path');

/**
 * Request logger middleware for logging incoming requests and outgoing responses to the server
 * @param {Object} options - Options for the request logger middleware
 * @param {String} options.format - Format of the log message (combined, short, long, tiny, dev)
 * @param {String} options.level - Log level (error, warn, info, verbose, debug, silly)
 * @param {String} options.logFile - Log file name or path to save logs (default: requests.log in the dist directory)
 * @returns {Function} Middleware function for logging requests and responses
 * @example
 * const rapidfy = require('rapidfy');
 * const app = rapidfy();
 * 
 * app.requestLogger({ format: 'combined', logFile: 'requests.log' });
 */
const requestLogger = (options = {}) => {
    const { format = 'dev', level = 'info' } = options;

    // Ensure the log file is set
    if (!options.logFile) {
        options.logFile = path.join(process.cwd(), 'dist', 'requests.log');
    }
    // Ensure the directory exists for the log file to be saved in it
    const logDir = path.dirname(options.logFile);
    if (!require('fs').existsSync(logDir)) {
        require('fs').mkdirSync(logDir, { recursive: true });
    }

    const logger = new Logger({
        level: level,
        format: format,
        transports: [
            new Logger.transports.Console(),
            new Logger.transports.File({ filename: options.logFile })
        ]
    });

    return (req, res, next) => {
        const start = process.hrtime();

        if (typeof res.on !== 'function') {
            console.error('res.on is not a function');
            return next();
        }

        res.on('finish', () => {
            const duration = process.hrtime(start);
            const durationInMs = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3);

            const logDetails = {
                method: req.method,
                url: req.url,
                status: res.statusCode,
                responseTime: `${durationInMs} ms`,
                contentLength: res.getHeader('Content-Length') || 0,
                remoteAddr: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                statusMessage: res.res?.statusMessage,
                date: new Date().toISOString()
            };

            let logMessage = '';
            let logMessageError = null;

            switch (format) {
                case 'combined':
                    if (res.statusCode >= 400) {
                        logMessageError = `${logDetails.remoteAddr} - - [${logDetails.date}] "${logDetails.method} ${logDetails.url} HTTP/${req.httpVersion}" ${logDetails.status} "${logDetails.statusMessage}" ${logDetails.contentLength} - ${logDetails.responseTime} - "${logDetails.userAgent}"`;
                        logMessage = `${logDetails.remoteAddr} - - [${logDetails.date}] "${logDetails.method} ${logDetails.url} HTTP/${req.httpVersion}" ${logDetails.status} ${logDetails.contentLength} - ${logDetails.responseTime} "${logDetails.userAgent}"`;
                    } else {
                        logMessage = `${logDetails.remoteAddr} - - [${logDetails.date}] "${logDetails.method} ${logDetails.url} HTTP/${req.httpVersion}" ${logDetails.status} ${logDetails.contentLength} - ${logDetails.responseTime} "${logDetails.userAgent}"`;
                    }
                    break;
                case 'short':
                    if (res.statusCode >= 400) {
                        logMessageError = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.statusMessage}`;
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime}`;
                    } else {
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime}`;
                    }
                    break;
                case 'long':
                    if (res.statusCode >= 400) {
                        logMessageError = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.statusMessage} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    } else {
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    }
                    break;
                case 'tiny':
                    if (res.statusCode >= 400) {
                        logMessageError = `${logDetails.method} ${logDetails.url} ${logDetails.status} "${logDetails.statusMessage}" ${logDetails.responseTime}`;
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime}`;
                    } else {
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime}`;
                    }
                    break;
                case 'dev':
                    if (res.statusCode >= 400) {
                        logMessageError = `${logDetails.method} ${logDetails.url} ${logDetails.status} "${logDetails.statusMessage}" ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    } else {
                        logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    }
                    break;
                default:
                    if (typeof format === 'function') {
                        logMessage = format(logDetails);
                    } else {
                        if (res.statusCode >= 400) {
                            logMessageError = `${logDetails.method} ${logDetails.url} ${logDetails.status} "${logDetails.statusMessage}" ${logDetails.responseTime}`;
                            logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime}`;
                        } else {
                            logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime}`;
                        }
                    }
            }

            logger.log({
                level: level,
                message: logMessage,
                error: logMessageError,
                color: res.statusCode >= 400 ? 'red' : 'green',
                format: format,
                url: logDetails.url                
            });
        });

        next();
    };
};

module.exports = requestLogger;