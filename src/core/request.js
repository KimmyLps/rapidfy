const { IncomingMessage } = require('http');

class Request extends IncomingMessage {
    constructor(req) {
        super(req.socket);
        Object.assign(this, req);
        // this.parseCookies();
        // this.parseBody();
        // this.parseParams();
        // this.parseQuery();
        // this.parseHeaders();
    }

    json() {
        return new Promise((resolve, reject) => {
            let data = '';
            this.req.on('data', chunk => data += chunk.toString());
            this.req.on('end', () => {
                if (!data) return resolve({});
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    parseCookies() {
        const cookieHeader = this.req.headers.cookie;
        if (!cookieHeader) return;
        const cookies = cookieHeader.split(';');
        cookies.forEach(cookie => {
            const [key, value] = cookie.split('=');
            this.cookies[key.trim()] = value;
        });
    }

    parseBody() {
        this.json().then(body => this.body = body);
    }

    parseParams() {
        const url = this.req.url;
        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 1];
        if (!isNaN(id)) this.params.id = parseInt(id);
    }

    parseQuery() {
        this.query.forEach((value, key) => this.query[key] = value);
    }

    parseHeaders() {
        // Ensure this.headers is an iterable
        if (Array.isArray(this.headers) || (this.headers && typeof this.headers[Symbol.iterator] === 'function')) {
            this.headers = Object.fromEntries(this.headers);
        }
    }

    get(field) {
        if (typeof field !== 'string') return;
        // field = field.toLowerCase();
        if (field === 'referer' || field === 'referrer') field = 'referer';

        // If the field is not in the headers object, return undefined
        if (this.headers && this.headers[field]) return this.headers[field];
        if (field === 'host') return this.headers[':authority'];
        if (this.params && this.params[field]) return this.params[field];
        if (this.query && this.query[field]) return this.query[field];
        if (this.cookies && this.cookies[field]) return this.cookies[field];
        if (this.body && this.body[field]) return this.body[field];
    }
}

module.exports = Request;