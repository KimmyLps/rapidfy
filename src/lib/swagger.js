const { prepareSpecification, extractSpecification, organizeAnnotations, finalizeSpecification } = require('./swagger-ui-assets/specification.js');
const { validateOptions } = require('../utils/swagger.js');
const path = require('path');
const fs = require('fs');


// const swagger = (options) => {
//     validateOptions(options);

//     const spec = prepareSpecification(options);

//     const parts = extractSpecification(options);

//     organizeAnnotations(spec, parts);

//     // return finalizeSpecification(spec, options);
//     const finalSpec = finalizeSpecification(spec, options);

//     return {
//         swaggerSpec: finalSpec,
//         serve: (options) => serve(options),
//     }
// };

/**
 * Swagger class for handling the generation and serving of Swagger documentation.
 * @returns {Swagger} Instance of the Swagger class.
 */
// class Swagger {
//     /**
//      * Constructor for the Swagger class.
//      * 
//      * @param {Object} options - Configuration options for Swagger setup.
//      * @param {string} options.encoding - Optional, passed to read file function options. Defaults to 'utf8'.
//      * @param {boolean} options.failOnErrors - Whether or not to throw when parsing errors. Defaults to false.
//      * @param {string} options.format - Optional, defaults to '.json' - target file format '.yml' or '.yaml'.
//      * @param {Object} options.swaggerDefinition - Swagger definition object.
//      * @param {Object} options.definition - API definition object.
//      * @param {Array} options.apis - Array of paths to files containing API annotations.
//      */
//     constructor(options) {
//         // Validate the provided options to ensure required fields are present and correctly formatted.
//         validateOptions(options);

//         // Prepare the initial Swagger object from the provided options.
//         this.swaggerObject = prepareSpecification(options);

//         // Extract annotations from the specified API files.
//         this.annotations = extractSpecification(options);

//         // Organize the Swagger object with the extracted annotations.
//         this.orgSwaggerObject = organizeAnnotations(this.swaggerObject, this.annotations);

//         // Finalize the Swagger object with the organized annotations.
//         this.finalSwaggerObject = finalizeSpecification(this.orgSwaggerObject, options);
//     }

//     /**
//      * Serves Swagger UI and API specification as middleware.
//      * 
//      * @param {Object} options - Configuration options for serving Swagger UI.
//      * @param {string} options.assetsDir - Directory containing Swagger UI assets.
//      * @param {string} options.pathDoc - Path to serve Swagger UI (e.g., '/docs').
//      * @param {string} options.pathSpec - Path to serve Swagger spec (e.g., '/swagger.json').
//      * @returns {Function} Middleware function to serve Swagger UI assets.
//      */
//     serve(options = {}) {
//         const assetsDir = options.assetsDir || path.join(__dirname, 'swagger-ui-assets');
//         const pathDoc = options.pathDoc || '/docs';
//         const swaggerUrl = options.swaggerUrl || '/swagger.json';
//         const swaggerSpec = this.finalSwaggerObject;

//         return (req, res, next) => {
//             const { url, method } = req;
//             if (url === swaggerUrl && method === 'GET') {
//                 res.json(swaggerSpec || { error: 'Swagger spec not provided' });
//             } else if (url === pathDoc && method === 'GET') {
//                 const htmlFile = path.join(assetsDir, 'swagger-ui.html');
//                 res.setHeader('Content-Type', 'text/html');
//                 res.sendFile(htmlFile);
//             } else if (url === '/index.css' && method === 'GET') {
//                 const cssFile = path.join(assetsDir, 'index.css');
//                 res.setHeader('Content-Type', 'text/css');
//                 res.sendFile(cssFile);
//             } else if (url === '/swagger-ui.css' && method === 'GET') {
//                 const cssFile = path.join(assetsDir, 'swagger-ui.css');
//                 res.setHeader('Content-Type', 'text/css');
//                 res.sendFile(cssFile);
//             } else if (url === '/swagger-ui.css.map' && method === 'GET') {
//                 const cssFile = path.join(assetsDir, 'swagger-ui.css.map');
//                 res.setHeader('Content-Type', 'text/css');
//                 res.sendFile(cssFile);
//             } else if (url === '/swagger-ui-bundle.js' && method === 'GET') {
//                 const jsFile = path.join(assetsDir, 'swagger-ui-bundle.js');
//                 res.setHeader('Content-Type', 'text/javascript');
//                 res.sendFile(jsFile);
//             } else if (url === '/swagger-ui-standalone-preset.js' && method === 'GET') {
//                 const jsFile = path.join(assetsDir, 'swagger-ui-standalone-preset.js');
//                 res.setHeader('Content-Type', 'text/javascript');
//                 res.sendFile(jsFile);
//             } else if (url === '/swagger-ui-initializer.js' && method === 'GET') {
//                 const jsFile = path.join(assetsDir, 'swagger-ui-initializer.js');
//                 const data = fs.readFileSync(jsFile, 'utf8');
//                 const updatedData = data.replace('var options = options || {};', `var options = ${JSON.stringify(options)};`);
//                 res.setHeader('Content-Type', 'text/html');
//                 res.send(updatedData);
//             } else {
//                 next();
//             }
//         }
//     };
// }



/**
 * Swagger function for handling the generation swagger documentation.
 * @param {object} options - Configuration options
 * @param {string} options.encoding Optional, passed to read file function options. Defaults to 'utf8'.
 * @param {boolean} options.failOnErrors Whether or not to throw when parsing errors. Defaults to false.
 * @param {string} options.formatSpecification Optional, defaults to '.json' - target file formatSpecification '.yml' or '.yaml'.
 * @param {object} options.swaggerDefinition
 * @param {object} options.definition
 * @param {array} options.apis
 * @returns {Object} Swagger specification object
 */
const createSwagger = (options) => {
    // Validate the provided options to ensure required fields are present and correctly formatted.
    validateOptions(options);

    // Prepare the initial Swagger object from the provided options.
    const swaggerObject = prepareSpecification(options);

    // Extract annotations from the specified API files.
    const annotations = extractSpecification(options);

    // Organize the Swagger object with the extracted annotations.
    organizeAnnotations(swaggerObject, annotations);

    // Finalize the Swagger object with the organized annotations.
    const finalSpec = finalizeSpecification(swaggerObject, options);

    return finalSpec;
}

/**
 * Serve swagger-ui assets as middleware.
 * @param {Object} options - Configuration options
 * @param {string} options.assetsDir - Directory containing swagger-ui assets
 * @param {string} options.pathDoc - Path to serve swagger-ui assets (e.g., '/docs') default to '/docs'
 * @param {string} options.pathSpec - Path to serve swagger spec (e.g., '/swagger.json') default to '/swagger.json'
 * @param {Object} options.spec - Swagger specification object to serve as JSON
 * @param {Array} options.swaggerUrls - Array of objects containing 'url' and 'name' properties for multiple swagger specs
 * @param {Object} options.customOptions - Custom options to pass to Swagger UI bundle initialization
 * @param {Object} options.customOptions.oauth - OAuth configuration object for Swagger UI bundle
 * @param {Object} options.customOptions.preauthorizeApiKey - Preauthorize API key configuration object for Swagger UI bundle
 * @param {Object} options.customOptions.preauthorizeApiKey.apiKey - API key to preauthorize for Swagger UI bundle
 * @param {Object} options.customOptions.preauthorizeApiKey.apiKeyValue - API key value to preauthorize for Swagger UI bundle
 * @param {Object} options.customOptions.authAction - Authorization action object for Swagger UI bundle
 * @param {Array} options.customOptions.authActions - Array of authorization action objects for Swagger UI bundle
 * @returns {Function} - Middleware function to serve swagger-ui assets as middleware function
 */
const swaggerServe = (options = {}) => {
    const assetsDir = options.assetsDir || path.join(__dirname, 'swagger-ui-assets');
    const pathDoc = options.pathDoc || '/docs';
    const pathSpec = options.pathSpec || '/swagger.json';
    const swaggerSpec = options.spec;

    return (req, res, next) => {
        const { url, method } = req;
        if (url === pathSpec && method === 'GET') {
            res.json(swaggerSpec || { error: 'Swagger spec not provided' });
        } else if (url === pathDoc && method === 'GET') {
            const htmlFile = path.join(assetsDir, 'swagger-ui.html');
            res.setHeader('Content-Type', 'text/html');
            res.sendFile(htmlFile);
        } else if (url === '/index.css' && method === 'GET') {
            const cssFile = path.join(assetsDir, 'index.css');
            res.setHeader('Content-Type', 'text/css');
            res.sendFile(cssFile);
        } else if (url === '/swagger-ui.css' && method === 'GET') {
            const cssFile = path.join(assetsDir, 'swagger-ui.css');
            res.setHeader('Content-Type', 'text/css');
            res.sendFile(cssFile);
        } else if (url === '/swagger-ui.css.map' && method === 'GET') {
            const cssFile = path.join(assetsDir, 'swagger-ui.css.map');
            res.setHeader('Content-Type', 'text/css');
            res.sendFile(cssFile);
        } else if (url === '/swagger-ui-bundle.js' && method === 'GET') {
            const jsFile = path.join(assetsDir, 'swagger-ui-bundle.js');
            res.setHeader('Content-Type', 'text/javascript');
            res.sendFile(jsFile);
        } else if (url === '/swagger-ui-standalone-preset.js' && method === 'GET') {
            const jsFile = path.join(assetsDir, 'swagger-ui-standalone-preset.js');
            res.setHeader('Content-Type', 'text/javascript');
            res.sendFile(jsFile);
        } else if (url === '/swagger-ui-initializer.js' && method === 'GET') {
            const jsFile = path.join(assetsDir, 'swagger-ui-initializer.js');
            const data = fs.readFileSync(jsFile, 'utf8');
            const updatedData = data.replace('var options = options || {};', `var options = ${JSON.stringify(options)};`);
            res.setHeader('Content-Type', 'text/html');
            res.send(updatedData);
        } else if (url === '/favicon-32x32.png' && method === 'GET') {
            const faviconFile = path.join(assetsDir, 'favicon-32x32.png');
            res.setHeader('Content-Type', 'image/png');
            res.sendFile(faviconFile);
        } else if (url === '/favicon-16x16.png' && method === 'GET') {
            const faviconFile = path.join(assetsDir, 'favicon-16x16.png');
            res.setHeader('Content-Type', 'image/png');
            res.sendFile(faviconFile);
        } else {
            next();
        }
    }
};

module.exports = {
    createSwagger,
    swaggerServe,
};