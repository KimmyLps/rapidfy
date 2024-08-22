class Router {
    constructor() {
        this.routes = [];
    }

    get(path, callback) {
        this.routes.push({ method: 'GET', path, callback });
    }

    post(path, callback) {
        this.routes.push({ method: 'POST', path, callback });
    }

    put(path, callback) {
        this.routes.push({ method: 'PUT', path, callback });
    }

    delete(path, callback) {
        this.routes.push({ method: 'DELETE', path, callback });
    }

    patch(path, callback) {
        this.routes.push({ method: 'PATCH', path, callback });
    }

    getRoutes() {
        return this.routes;
    }

    handleRequest(req, res) {
        const { url, method } = req;
        const route = this.routes.find(route => route.path === url && route.method === method);
        if (!route) {
            console.error(`Route not found: ${method} ${url}`);
            res.statusCode = 404;
            res.end('Not found');
        } else {
            route.callback(req, res);
        }
    }
}

module.exports = Router;