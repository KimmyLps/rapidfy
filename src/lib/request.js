var { IncomingMessage } = require('http');

exports = module.exports = class Request extends IncomingMessage {
    constructor(req) {
        super(req.socket);
        Object.assign(this, req);
        this.init();
    }

    init() {
        this.query = {};
        // this.params = {};
        // this.body = {};
        // this.headers = {};

        const url = new URL(this.url, `http://${this.headers.host}`);
        this.query = Object.fromEntries(url.searchParams);
    }
    
    getQuery(name) {
        return this.query[name];
    }

    getHeader(name) {
        return this.headers[name.toLowerCase()];
    }

    setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
    }

    on(event, listener) {
        return super.on(event, listener);
    }

    // get statusCode() {
    //     return this.res.statusCode;
    // }

    // set statusCode(code) {
    //     this.res.statusCode = code;
    // }
}