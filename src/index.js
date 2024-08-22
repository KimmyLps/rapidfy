const http = require('http');
const Router = require('./core/router');
const Request = require('./core/request');
const Response = require('./core/response');
const MiddlewareManager = require('./core/middleware');
const ErrorHandler = require('./core/error-handler');
const requestLogger = require('./utils/logger');
const { parseBody } = require('./utils/parser');

const rapidfy = () => {
    const router = new Router();
    const middlewareManager = new MiddlewareManager();

    // Initial request logger middleware
    middlewareManager.use(requestLogger('dev'));

    const handler = (req, res) => {
        const request = new Request(req);
        const response = new Response(res);

        middlewareManager.execute(request, response, () => {
            try {
                router.handleRequest(request, response);
            } catch (error) {
                ErrorHandler.handleServerError(error, request, response);
            }
        });
    };

    return {
        get: (path, handler) => router.get(path, handler),
        post: (path, handler) => router.post(path, handler),
        put: (path, handler) => router.put(path, handler),
        delete: (path, handler) => router.delete(path, handler),
        patch: (path, handler) => router.patch(path, handler),
        use: (middleware) => middlewareManager.use(middleware),
        listen: (port, callback) => {
            const server = http.createServer(handler);
            server.listen(port, callback);
        },
        /**
         * 
         * @param {*} options  Object with options for requestLogger middleware
         * @param {*} options.format  String with format for log message (combined, short, long, tiny, dev)
         * @param {*} options.production  Boolean to enable or disable production mode
         * @returns 
         */
        requestLogger: (options) => middlewareManager.use(requestLogger(options)),
        parsBody: (options) => middlewareManager.use(parseBody(options)),
    }
};

module.exports = rapidfy;