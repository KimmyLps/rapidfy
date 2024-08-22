const parseJson = (req) => {
    return new Promise((resolve, reject) => {
        if (typeof req.on !== 'function') {
            return reject(new Error('Invalid request object'));
        }

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
};

const parseUrlEncoded = (req) => {
    const queryString = require('querystring');
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(queryString.parse(body));
            } catch (err) {
                reject(new Error('Invalid URL-encoded'));
            }
        });
    });
};

const parseCookies = (cookieHeader) => {
    const cookies = {};
    if (!cookieHeader) return cookies;
    const cookiePairs = cookieHeader.split(';');
    cookiePairs.forEach(cookiePair => {
        const [key, value] = cookiePair.split('=');
        cookies[key.trim()] = value;
    });
    return cookies;
}

const parseBody = (options = {}) => {
    return async (req, res, next) => {
        try {
            if (req.headers['content-type'] === 'application/json') {
                req.body = await parseJson(req);
            } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                req.body = await parseUrlEncoded(req);
            } else {
                req.body = {};
            }
            next();
        } catch (err) {
            res.statusCode = 400;
            res.end(`Error parsing body: ${err.message}`);
        }
    }
};

const parseParams = (req) => {
    const url = req.url;
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    if (!isNaN(id)) return { id: parseInt(id) };
    return {};
}

const parseQuery = (req) => {
    const query = new URLSearchParams(req.url.split('?')[1]);
    const queryParams = {};
    query.forEach((value, key) => queryParams[key] = value);
    return queryParams;
}

const parseHeaders = (headers) => {
    return Object.fromEntries(headers);
}

module.exports = {
    parseJson,
    parseUrlEncoded,
    parseBody,
    parseCookies,
    parseBody,
    parseParams,
    parseQuery,
    parseHeaders
};