var http = require('http');
var Router = require('./router/router').Router;
var createRouter = require('./router/router');
var Request = require('./request');
var Response = require('./response');
var MiddlewareManager = require('./middleware');
var { parseBody } = require('../utils/parser');

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

    use(path, middleware) {
        if (typeof path === 'object') {
            if (path instanceof Router) {
                this.router.use('/', path);
            } else {
                this.middleware.use(path);
            }
        }

        if (typeof path === 'string' && typeof middleware === 'function') {
            this.router.use(path, middleware);
        }

        if (typeof path === 'string' && typeof middleware === 'object') {
            if (middleware instanceof Router) {
                this.router.use(path, middleware);
            } else {
                this.middleware.use(path, middleware);
            }
        }

        if (typeof path === 'function') {
            this.middleware.use(path);
        }
    }

    get(path, handler) {
        this.router.get(path, handler);
    }

    post(path, handler) {
        this.router.post(path, handler);
    }

    put(path, handler) {
        this.router.put(path, handler);
    }

    delete(path, handler) {
        this.router.delete(path, handler);
    }

    patch(path, handler) {
        this.router.patch(path, handler);
    }

    all(path, handler) {
        this.router.all(path, handler);
    }

    handle(req, res) {
        const request = new Request(req);
        const response = new Response(res);

        this.middleware.apply(request, response, (err) => {
            if (err) {
                this.errorHandler(err, request, response);
            } else {
                this.router.handle(request, response);
            }
        });
    }

    listen(port, cb) {
        const server = http.createServer(this.handle.bind(this));
        server.listen(port, cb);
    }

    errorHandler(err, req, res) {
        console.error('Unhandled error:', err);
    }
}

exports.json = function (options) {
    return parseBody(options);
}

// export type Router = Router;
// export type Request = Request;
// export type Response = Response;
// export type MiddlewareManager = MiddlewareManager;
// export type ErrorHandler = ErrorHandler;
exports.Router = createRouter;