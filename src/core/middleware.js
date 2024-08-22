class MiddlewareManager {
    constructor() {
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    execute(req, res, done) {
        const runMiddleware = (index) => {
            if (index >= this.middlewares.length) return done();
            const middleware = this.middlewares[index];
            middleware(req, res, () => runMiddleware(index + 1));
        };

        runMiddleware(0);
    }
}

module.exports = MiddlewareManager;
