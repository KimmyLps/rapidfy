
exports = module.exports = class MiddlewareManager {
    constructor() {
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    execute(req, res, cb) {
        const stack = this.middlewares;
        let index = 0;

        const next = () => {
            try {
                if (index < stack.length) {
                    const middleware = stack[index++];
                    middleware(req, res, next);
                } else {
                    cb();
                }
            } catch (err) {
                cb(err);
            }
        };

        next();
    }
}