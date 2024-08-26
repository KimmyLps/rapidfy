const path = require('path');
const fs = require('fs');
const { parseSwaggerComments } = require('../utils/parser');

class SwaggerUI {
    constructor(app) {
        this.app = app;
        this.swaggerSpec = null;
        this.swaggerOptions = null;
        this.swaggerUIDistDir = path.join(path.join(__dirname, '..', '..'), 'public/swagger');
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
        const app = this.app;
        app.use(specPath, (_, res) => {
            res.json(this.swaggerSpec || { error: 'Swagger spec not provided' });
        });
        app.use(docsPath, (_, res) => {
            const htmlFile = path.join(this.swaggerUIDistDir, 'swagger-ui.html');

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
        });
        app.use('/index.css', (_, res) => {
            const cssFile = path.join(this.swaggerUIDistDir, 'index.css');
            res.setHeader('Content-Type', 'text/css');
            res.sendFile(cssFile);
        });
        app.use('/swagger-ui.css', (_, res) => {
            const cssFile = path.join(this.swaggerUIDistDir, 'swagger-ui.css');
            res.setHeader('Content-Type', 'text/css');
            res.sendFile(cssFile);
        });
        app.use('/swagger-ui.css.map', (_, res) => {
            const cssMapFile = path.join(this.swaggerUIDistDir, 'swagger-ui.css.map');
            res.setHeader('Content-Type', 'application/json');
            res.sendFile(cssMapFile);
        });
        app.use('/swagger-ui-bundle.js', (_, res) => {
            const jsFile = path.join(this.swaggerUIDistDir, 'swagger-ui-bundle.js');
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(jsFile);
        });
        app.use('/swagger-ui-standalone-preset.js', (_, res) => {
            const jsFile = path.join(this.swaggerUIDistDir, 'swagger-ui-standalone-preset.js');
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(jsFile);
        });
        app.use('/swagger-initializer.js', (_, res) => {
            const jsFile = path.join(this.swaggerUIDistDir, 'swagger-initializer.js');

            const data = fs.readFileSync(jsFile, 'utf8');
            // const data = fs.readFileSync(htmlFile, 'utf8');
            if (this.swaggerOptions) {
                const options = JSON.stringify(this.swaggerOptions);
                const updatedData = data.replace('window.ui = ui', `window.ui = ui\nwindow.ui.initOAuth(${options})`);
                res.setHeader('Content-Type', 'text/html');
                res.send(updatedData);
                return;
            }
            // console.log(data);
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(jsFile);
        });

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

module.exports = SwaggerUI;