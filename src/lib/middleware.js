var Router = require('./router/router').Router;

exports = module.exports = class MiddlewareManager {
    constructor() {
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    apply(req, res, cb) {
        const stack = this.middlewares.slice();
        let index = 0;

        const next = (err) => {
            if (err) {
                return cb(err);
            }

            if (index >= stack.length) {
                return cb();
            }

            const middleware = stack[index++];
            if (typeof middleware === 'function') {
                middleware(req, res, next);
            } else if (middleware instanceof Router) {
                middleware.handle(req, res);
            } else {
                next();
            }
        }

        next();
    }
}