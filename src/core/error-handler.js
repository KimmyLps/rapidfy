class ErrorHandler {
    static handleError(err, req, res) {
        console.error(err);
        res.statusCode = 400;
        res.end('Bad request');
    }

    static handleServerError(err, req, res) {
        console.error(err);
        res.statusCode = 500;
        res.end('Internal server error');
    }

    static handleNotFound(err, req, res) {
        res.statusCode = 404;
        res.end('Not found');
    }
    
    static handleUnauthorized(err, req, res) {
        console.error(err);
        res.statusCode = 401;
        res.end('Unauthorized');
    }

    static handleForbidden(err, req, res) {
        console.error(err);
        res.statusCode = 403;
        res.end('Forbidden');
    }

    static handleMethodNotAllowed(err, req, res) {
        console.error(err);
        res.statusCode = 405;
        res.end('Method not allowed');
    }

    static handleConflict(err, req, res) {
        console.error(err);
        res.statusCode = 409;
        res.end('Conflict');
    }

    static handleGone(err, req, res) {
        console.error(err);
        res.statusCode = 410;
        res.end('Gone');
    }

    static handlePreconditionFailed(err, req, res) {
        console.error(err);
        res.statusCode = 412;
        res.end('Precondition failed');
    }

    static handleUnsupportedMediaType(err, req, res) {
        console.error(err);
        res.statusCode = 415;
        res.end('Unsupported media type');
    }

    static handleUnprocessableEntity(err, req, res) {
        console.error(err);
        res.statusCode = 422;
        res.end('Unprocessable entity');
    }

    static handleTooManyRequests(err, req, res) {
        console.error(err);
        res.statusCode = 429;
        res.end('Too many requests');
    }

    static handleServiceUnavailable(err, req, res) {
        console.error(err);
        res.statusCode = 503;
        res.end('Service unavailable');
    }

    static handleGatewayTimeout(err, req, res) {
        console.error(err);
        res.statusCode = 504;
        res.end('Gateway timeout');
    }

    static handleHttpError(err, req, res) {
        console.error(err);
        res.statusCode = err.statusCode;
        res.end(err.message);
    }
}

module.exports = ErrorHandler;