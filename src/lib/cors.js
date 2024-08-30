/**
 * Export the cors middleware function to be used in the application.
 * @param {Object} options The options object to configure the CORS middleware.
 * @param {string} options.origins The allowed origins to access the API.
 * @param {string} options.allowedOrigins Or the allowed origins to access the API.
 * @param {string} options.methods The allowed methods to access the API.
 * @param {string} options.allowedMethods Or the allowed methods to access the API.
 * @param {string} options.headers The allowed headers to access the API.
 * @param {string} options.allowedHeaders Or the allowed headers to access the API.
 * @param {string} options.exposes The headers to expose to the client.
 * @param {string} options.exposedHeaders Or the headers to expose to the client.
 * @param {boolean} options.credentials A boolean value to allow credentials.
 * @param {boolean} options.allowCredentials Or a boolean value to allow credentials.
 * @param {number} options.maxAge The max age for the preflight request.
 * @param {number} options.options The success status code for the preflight request.
 * @param {number} options.optionSuccessStatus Or the success status code for the preflight request.
 * @param {string} options.errorMessage The error message to send when the origin is not allowed.
 * @param {Function} options.originValidator A function to validate the origin. Arguments: origin. It should return a boolean value.
 * @param {Function} options.customHeadersHandler A function to handle custom headers. Arguments: res, req, next. It should return a boolean value.
 * @param {boolean} options.preflightContinue A boolean value to continue the preflight request.
 * @param {Function} options.handlerError A function to handle the error. Arguments: res, req, next. It should return a boolean value.
 * @example
 * const rapidfyJs = require('rapidfy-js');
 * const app = rapidfyJs();
 * app.use(rapidfyJs.cors({
 *    origins: 'http://example.com',
 *    methods: 'GET,POST,PUT,DELETE,OPTIONS',
 *    headers: 'Content-Type,Authorization',
 * }));
 * @returns {Function} The CORS middleware function.
 */
const cors = (options = {}) => {
    return (req, res, next) => {
        let origins = options.origins || options.allowedOrigins || '*';
        let methods = options.methods || options.allowedMethods || 'GET,POST,PUT,DELETE,OPTIONS';
        let headers = options.headers || options.allowedHeaders || 'Content-Type,Authorization';
        let exposedHeaders = options.exposes || options.exposedHeaders || '';
        let credentials = options.credentials || options.allowCredentials || false;
        let maxAge = options.maxAge || 86400;
        let optionSuccessStatus = options.options || options.optionSuccessStatus || 204;
        let errorMessage = options.errorMessage || 'CORS policy: No access-control-allow-origin header is present on the requested resource.';

        // Advanced CORS policy
        let originValidator = options.originValidator || null;
        let customHeadersHandler = options.customHeadersHandler || null;
        let preflightContinue = options.preflightContinue || false;
        let handlerError = options.handlerError || null;


        let isOriginAllowed = ((typeof originValidator === 'function' && originValidator(req.headers.origin)) || origins === '*' || origins.includes(req.headers.origin));
        let isMethodAllowed = methods === '*' || methods.includes(req.method);

        const setAllowedHeaders = () => {
            res.setHeader('Access-Control-Allow-Origin', origins === '*' ? '*' : req.headers.origin);
            res.setHeader('Access-Control-Allow-Methods', methods);
            res.setHeader('Access-Control-Allow-Headers', headers);

            if (credentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }

            if (exposedHeaders) {
                res.setHeader('Access-Control-Expose-Headers', exposedHeaders);
            }

            res.setHeader('Access-Control-Max-Age', maxAge);
        };

        if (req.method === 'OPTIONS') {
            if (isOriginAllowed && isMethodAllowed) {
                setAllowedHeaders();

                if (typeof customHeadersHandler === 'function') {
                    customHeadersHandler(res, req, next);
                }

                if (preflightContinue) {
                    next();
                } else {
                    res.setHeader('Content-Length', 0);
                    res.sendStatus(optionSuccessStatus);
                }
            } else {
                if (typeof handlerError === 'function') {
                    handlerError(res, req, next);
                } else {
                    res.status(403).json({ error: errorMessage });
                }
            }
        } else {
            if (isOriginAllowed && isMethodAllowed) {
                setAllowedHeaders();

                next();
            } else {
                if (typeof handlerError === 'function') {
                    handlerError(res, req, next);
                } else {
                    res.status(403).json({ error: errorMessage });
                }
            }
        }
    };
};

module.exports = {
    cors,
};