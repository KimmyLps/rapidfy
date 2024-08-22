const http = require('http');

class Response {
    constructor(res) {
        this.res = res;
    }

    on(event, listener) {
        return this.res.on(event, listener);
    }

    status(code) {
        this.res.statusCode = code;
        return this;
    }

    json(data) {
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(data)));
        this.res.end(JSON.stringify(data));
    }

    send(body) {
        this.setHeader('Content-Type', 'text/plain');
        this.setHeader('Content-Length', Buffer.byteLength(body));
        this.res.end(body);
    }

    getHeader(name) {
        return this.res.getHeader(name);
    }

    setHeader(name, value) {
        return this.res.setHeader(name, value);
    }

    end(...args) {
        return this.res.end(...args);
    }

    get statusCode() {
        return this.res.statusCode;
    }

    set statusCode(code) {
        this.res.statusCode = code;
    }
}

module.exports = Response;