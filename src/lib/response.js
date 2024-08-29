const fs = require('fs');
const path = require('path');
const { ServerResponse } = require('http');

exports = module.exports = class Response {
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
        if (!this.getHeader('Content-Type')) {
            this.setHeader('Content-Type', 'application/json');
        }

        if (data) {
            this.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(data)));
            this.res.end(JSON.stringify(data));
        } else {
            this.res.end();
        }
    }

    send(body) {
        if (body instanceof Error) {
            this.status(500).send(body.message);
            return this;
        }

        if (typeof body === 'number') {
            this.status(body).send();
            return this;
        }

        if (typeof body === 'string') {
            if (!this.getHeader('Content-Type')) {
                this.setHeader('Content-Type', 'text/plain');
            }
            this.setHeader('Content-Length', Buffer.byteLength(body));
            this.res.end(body);
            return this;
        }

        if (Buffer.isBuffer(body)) {
            if (!this.getHeader('Content-Type')) {
                this.setHeader('Content-Type', 'application/octet-stream');
            }
            this.setHeader('Content-Length', body.length);
            this.res.end(body);
            return this;
        }

        if (typeof body === 'object') {
            this.json(body);
            return this;
        }
    }

    sendFile(filePath) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.status(500).send('Internal Server Error');
                return;
            }
            this.send(data);
        });
        return this;
    }

    // redirect(url) {
    //     this.status(302).setHeader('Location', url).end();
    //     return this;
    // }

    end(...args) {
        return this.res.end(...args);
    }

    getHeader(name) {
        return this.res.getHeader(name);
    }

    setHeader(name, value) {
        return this.res.setHeader(name, value);
    }

    sendStatus(code) {
        this.status(code).send(code.toString());
        return this;
    }

    get statusCode() {
        return this.res.statusCode;
    }

    set statusCode(code) {
        this.res.statusCode = code;
    }


    // setCookie(name, value, options = {}) {
    //     let cookie = `${name}=${value}`;
    //     if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    //     if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    //     if (options.path) cookie += `; Path=${options.path}`;
    //     if (options.domain) cookie += `; Domain=${options.domain}`;
    //     if (options.secure) cookie += `; Secure`;
    //     if (options.httpOnly) cookie += `; HttpOnly`;
    //     if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    //     this.appendHeader('Set-Cookie', cookie);
    //     return this;
    // }

    // clearCookie(name, options = {}) {
    //     this.setCookie(name, '', { ...options, maxAge: 0 });
    //     return this;
    // }

    // download(filePath, fileName) {
    //     this.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    //     this.sendFile(filePath);
    //     return this;
    // }

    // render(view, data) {
    //     const viewPath = path.join(__dirname, '..', 'views', view);
    //     fs.readFile(viewPath, 'utf8', (err, content) => {
    //         if (err) {
    //             this.status(500).send('Internal Server Error');
    //             return;
    //         }
    //         const rendered = content.replace(/{{([^{}]*)}}/g, (match, key) => data[key.trim()] || '');
    //         this.send(rendered);
    //     });
    //     return this;
    // }

    // // Helper method to append headers
    // appendHeader(name, value) {
    //     const current = this.getHeader(name);
    //     if (current) {
    //         this.setHeader(name, Array.isArray(current) ? current.concat(value) : [current, value]);
    //     } else {
    //         this.setHeader(name, value);
    //     }
    // }
}