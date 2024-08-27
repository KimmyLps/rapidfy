var http = require('http');
var Router = require('./router/router').Router;
var createRouter = require('./router/router');
var Request = require('./request');
var Response = require('./response');
var MiddlewareManager = require('./middleware');
var { parseBody } = require('../utils/parser');
var SwaggerUI = require('./swagger');

exports = module.exports = createApplication;

function createApplication() {
    return new Rapidfy();
}

class Rapidfy {
    constructor() {
        this.router = createRouter();
        this.middleware = new MiddlewareManager();
        this.init();
    }

    init() {
        // this.use(parseBody());
    }

    use(path, middleware = null) {
        if (typeof path === 'function') {
            this.middleware.use(path);
        } else if (typeof path === 'string' && typeof middleware === 'function') {
            this.middleware.use((req, res, next) => {
                if (req.path.startsWith(path)) {
                    return middleware(req, res, next);
                }
                next();
            });
        } else if (typeof path === 'string' && middleware && typeof middleware.handle === 'function') {
            this.middleware.use((req, res, next) => {
                if (req.url.startsWith(path)) {
                    return middleware.handle(req, res, next);
                }
                next();
            });
        } else if (path && typeof path.handle === 'function') {
            this.middleware.use((req, res, next) => path.handle(req, res, next));
        } else {
            this.router.errorHandler(new Error('Invalid middleware'), req, res);
        }
    }

    get(path, handler) {
        this.router.route(path, 'GET', handler);
    }

    post(path, handler) {
        this.router.route(path, 'POST', handler);
    }

    put(path, handler) {
        this.router.route(path, 'PUT', handler);
    }

    delete(path, handler) {
        this.router.route(path, 'DELETE', handler);
    }

    patch(path, handler) {
        this.router.route(path, 'PATCH', handler);
    }

    all(path, handler) {
        this.router.route(path, '*', handler);
    }

    handle(req, res) {
        const request = new Request(req);
        const response = new Response(res);

        this.middleware.execute(request, response, (err) => {
            if (err) {
                return this.router.errorHandler(err, request, response);
            }
            this.router.handle(request, response);
        });
    }

    listen(port, cb) {
        const server = http.createServer(this.handle.bind(this));
        server.listen(port, cb);
    }
}

exports.json = function (options) {
    return parseBody(options);
}

exports.Router = createRouter;