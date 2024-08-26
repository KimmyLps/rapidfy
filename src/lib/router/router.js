class Router {
    constructor() {
        this.routes = [];
    }

    get(path, handler) {
        this.routes.push({ path, method: 'GET', handler });
    }

    post(path, handler) {
        this.routes.push({ path, method: 'POST', handler });
    }

    put(path, handler) {
        this.routes.push({ path, method: 'PUT', handler });
    }

    delete(path, handler) {
        this.routes.push({ path, method: 'DELETE', handler });
    }

    patch(path, handler) {
        this.routes.push({ path, method: 'PATCH', handler });
    }

    all(path, handler) {
        this.routes.push({ path, method: '*', handler });
    }

    use(path, handler) {
        if (typeof path === 'string' && handler instanceof Router) {
            if (path === '/' || path === '*' || path === '') path = '';
            handler.routes.forEach(r => {
                this.routes.push({ path: path + r.path, method: r.method, handler: r.handler });
            });
        } else if (typeof path === 'string' && typeof handler === 'function') {
            this.routes.push({ path, method: '*', handler });
        } else if (typeof path === 'function') {
            this.routes.push({ path: '/', method: '*', handler: path });
        } else if (typeof path === 'object') {
            if (path instanceof Router) {
                path.routes.forEach(r => {
                    this.routes.push({ path: r.path, method: r.method, handler: r.handler });
                });
            }
        }

        return this;
    }

    route(path, method, handler) {
        this.routes.push({ path, method, handler });
    }

    matchRoute(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const query = Object.fromEntries(url.searchParams);


        for (let route of this.routes) {
            const pathParts = route.path.split('/');
            const urlParts = url.pathname.split('/');

            if (pathParts.length !== urlParts.length || route.method !== req.method) continue;

            const params = {};
            let matched = true;

            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i].startsWith(':')) {
                    params[pathParts[i].substring(1)] = urlParts[i];
                } else if (pathParts[i] !== urlParts[i]) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                req.params = params;
                req.query = query;
                return route;
            }
        }

        return null;
    }

    handle(req, res) {
        let route = this.matchRoute(req);
        if (route) {
            return route.handler(req, res);
        } else {
            this.notFound(req, res);
        }
    }

    errorHandler(err, req, res) {
        console.error('Unhandled error:', err);
        res.status(500).send('Internal Server Error');
    }

    notFound(req, res) {
        res.status(404).json({ message: 'Not Found', method: req.method, path: req.url });
    }
}

function createRouter() {
    return new Router();
}

exports = module.exports = createRouter;
exports.Router = Router;