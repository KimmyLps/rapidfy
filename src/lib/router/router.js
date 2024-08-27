const url = require('url');

class Router {
    constructor() {
        this.routes = [];
    }

    route(path, method, handler) {
        const pathRegex = this._pathToRegex(path);
        const params = this._getParamNames(path);
        this.routes.push({ path, pathRegex, params, method, handler });
    }

    _pathToRegex(path) {
        return new RegExp('.*' + path.replace(/:\w+/g, '([^\\/]+)') + '$');
    }

    _getParamNames(path) {
        const paramNames = [];
        const params = path.match(/:\w+/g);
        if (params) {
            params.forEach(param => paramNames.push(param.substring(1)));
        }
        return paramNames;
    }

    _parseParams(route, matches) {
        const params = {};
        route.params.forEach((name, index) => {
            params[name] = matches[index + 1];
        });
        return params;
    }

    get(path, handler) {
        this.route(path, 'GET', handler);
    }

    post(path, handler) {
        this.route(path, 'POST', handler);
    }

    put(path, handler) {
        this.route(path, 'PUT', handler);
    }

    delete(path, handler) {
        this.route(path, 'DELETE', handler);
    }

    patch(path, handler) {
        this.route(path, 'PATCH', handler);
    }

    all(path, handler) {
        this.route(path, '*', handler);
    }

    handle(req, res) {
        const { pathname, query } = url.parse(req.url, true)
        req.query = query;

        try {
            const route = this.routes.find(r => r.method === req.method && r.pathRegex.test(pathname));
            if (!route) return this.notFound(req, res);
            const matches = pathname.match(route.pathRegex);
            req.params = this._parseParams(route, matches);
            route.handler(req, res);
        } catch (err) {
            this.errorHandler(err, req, res);
        }
    }

    errorHandler(err, _, res) {
        console.error('Unhandled error:', err);
        res.status(500).json({ message: `Internal Server Error: ${err.message}` });
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