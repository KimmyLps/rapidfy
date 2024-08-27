const path = require('path');
const fs = require('fs');
const Router = require('./router/router');
const { parseSwaggerComments } = require('../utils/parser');

class SwaggerUI {
    constructor() {
        this.router = Router();
        this.router = Router();
        this.swaggerSpec = null;
        this.swaggerOptions = null;
        this.swaggerUIDir = path.join(__dirname, './swagger');
    }

    setSwaggerSpec(swaggerSpec) {
        this.swaggerSpec = swaggerSpec;
        return this;
    }

    setSwaggerOptions(swaggerOptions) {
        this.swaggerOptions = swaggerOptions;
        return this;
    }

    serve(specPath = '/swagger.json', docsPath = '/docs') {
        this.router.get(specPath, (_, res, next) => {
            if (!res.writableEnded) {
                console.log('Spec path');
                res.json(this.swaggerSpec || { error: 'Swagger spec not provided' });
            } else {
                next();
            }
        });
        this.router.get(docsPath, (_, res, next) => {
            if (!res.writableEnded) {
                console.log('Docs path');
                const htmlFile = path.join(this.swaggerUIDir, 'swagger-ui.html');
    
                // const data = fs.readFileSync(htmlFile, 'utf8');
                // if (this.swaggerOptions) {
                //     const options = JSON.stringify(this.swaggerOptions);
                //     const updatedData = data.replace('window.ui = ui', `window.ui = ui\nwindow.ui.initOAuth(${options})`);
                //     res.setHeader('Content-Type', 'text/html');
                //     res.send(updatedData);
                //     return;
                // }
                res.setHeader('Content-Type', 'text/html');
                res.sendFile(htmlFile);
            } else {
                next();
            }
        });
        // this.router.get('/index.css', (_, res) => {
        //     console.log('Index css');
        //     const cssFile = path.join(this.swaggerUIDir, 'index.css');
        //     res.setHeader('Content-Type', 'text/css');
        //     res.sendFile(cssFile);
        // });
        // this.router.get('/swagger-ui.css', (_, res) => {
        //     console.log('Swagger css');
        //     const cssFile = path.join(this.swaggerUIDir, 'swagger-ui.css');
        //     res.setHeader('Content-Type', 'text/css');
        //     res.sendFile(cssFile);
        // });
        // this.router.get('/swagger-ui.css.map', (_, res) => {
        //     console.log('Swagger css map');
        //     const cssMapFile = path.join(this.swaggerUIDir, 'swagger-ui.css.map');
        //     res.setHeader('Content-Type', 'application/json');
        //     res.sendFile(cssMapFile);
        // });
        // this.router.get('/swagger-ui-bundle.js', (_, res) => {
        //     console.log('Swagger bundle js');
        //     const jsFile = path.join(this.swaggerUIDir, 'swagger-ui-bundle.js');
        //     res.setHeader('Content-Type', 'application/javascript');
        //     res.sendFile(jsFile);
        // });
        // this.router.get('/swagger-ui-standalone-preset.js', (_, res) => {
        //     console.log('Swagger standalone preset js');
        //     const jsFile = path.join(this.swaggerUIDir, 'swagger-ui-standalone-preset.js');
        //     res.setHeader('Content-Type', 'application/javascript');
        //     res.sendFile(jsFile);
        // });
        // this.router.get('/swagger-initializer.js', (_, res) => {
        //     console.log('Swagger initializer js');
        //     const jsFile = path.join(this.swaggerUIDir, 'swagger-initializer.js');

        //     const data = fs.readFileSync(jsFile, 'utf8');
        //     // const data = fs.readFileSync(htmlFile, 'utf8');
        //     if (this.swaggerOptions) {
        //         const options = JSON.stringify(this.swaggerOptions);
        //         const updatedData = data.replace('window.ui = ui', `window.ui = ui\nwindow.ui.initOAuth(${options})`);
        //         res.setHeader('Content-Type', 'text/html');
        //         res.send(updatedData);
        //         return;
        //     }
        //     // console.log(data);
        //     res.setHeader('Content-Type', 'application/javascript');
        //     res.sendFile(jsFile);
        // });

        return this;
    }

    swaggerGen(sourceDir) {
        const initialSwaggerSpec = {
            swagger: '2.0',
            info: {
                version: '1.0.0',
                title: 'My API',
                description: 'API documentation'
            },
            host: 'localhost:3000',
            basePath: '/',
            schemes: ['http'],
            paths: {}
        };
        const files = fs.readdirSync(sourceDir);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const filePath = path.join(sourceDir, file);
                const swaggerJson = parseSwaggerComments(filePath);
                if (!this.swaggerSpec) {
                    this.swaggerSpec = initialSwaggerSpec;
                    return;
                }
                if (swaggerJson) {
                    Object.assign(this.swaggerSpec.paths, swaggerJson && swaggerJson.paths);
                    return;
                }
            }
        });

        return this;
    }
}

function createSwaggerUI(app) {
    return new SwaggerUI(app);
}
exports = module.exports = createSwaggerUI;
exports.SwaggerUI = SwaggerUI;