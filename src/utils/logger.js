// logger.js
const requestLogger = (options = {}) => {
    const { format = 'combined', production = false } = options;

    if (options.production) {
        return (req, res, next) => next();
    }

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
                date: new Date().toISOString()
            };

            let logMessage = '';

            switch (format) {
                case 'combined':
                    logMessage = `${logDetails.remoteAddr} - - [${logDetails.date}] "${logDetails.method} ${logDetails.url} HTTP/${req.httpVersion}" ${logDetails.status} ${logDetails.contentLength} - ${logDetails.responseTime} "${logDetails.userAgent}"`;
                    break;
                case 'short':
                    logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime}`;
                    break;
                case 'long':
                    logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    break;
                case 'tiny':
                    logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime}`;
                    break;
                case 'dev':
                    logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} ${logDetails.responseTime} - ${logDetails.contentLength} bytes`;
                    break;
                default:
                    logMessage = `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.responseTime}`;
            }

            console.log(logMessage);
        });

        next();
    };
};


module.exports = requestLogger;