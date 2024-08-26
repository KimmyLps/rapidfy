var parser = module.exports = {};

parser.parseJSON = function (req) {
    return new Promise((resolve, reject) => {
        if (typeof req.on !== 'function') {
            return reject(new Error('Invalid request object'));
        }

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
                resolve(req);
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

parser.parseUrlEncoded = function (req) {
    const queryString = require('querystring');
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                req.body = queryString.parse(body);
                resolve(req);
            } catch (error) {
                reject(new Error('Invalid URL-encoded'));
            }
        });
    });
}

parser.parseCookies = function (cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    const cookiePairs = cookieHeader.split(';');
    cookiePairs.forEach(cookiePair => {
        const [key, value] = cookiePair.split('=');
        cookies[key.trim()] = value;
    });
    return cookies;
}

parser.parseBody = function (options = {}) {
    return async (req, res, next) => {
        try {
            if (req.headers['content-type'] === 'application/json') {
                req = await module.exports.parseJSON(req);
            } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                req = await module.exports.parseUrlEncoded(req);
            } else {
                req.body = {};
            }
            next();
        } catch (error) {
            res.status(400).end(`Error parsing body: ${error.message}`);
        }
    }
}

parser.parseParams = function () {
    return (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        req.params = Object.fromEntries(url.searchParams);
        req.url = url.pathname;
        next();
    };
}