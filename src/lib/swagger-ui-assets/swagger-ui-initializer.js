window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">
    var options = options || {};
    var url = window.location.search.match(/url=([^&]+)/);
    if (url && url.length > 1) {
        url = decodeURIComponent(url[1]);
    } else {
        url = window.location.origin + options.pathSpec;
    }
    // url = options.pathSpec || url;
    var urls = options.swaggerUrls;
    var customOptions = options.customOptions;

    var swaggerOptions = {
        url: url || "https://petstore.swagger.io/v2/swagger.json",
        urls: urls,
        spec: options.spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
    };
    
    if (customOptions) {
        document.title = customOptions.customSiteTitle ? customOptions.customSiteTitle + ' - RapidfyJS' : document.title;

        if (customOptions.oauth) {
            ui.initOAuth(customOptions.oauth);
        }

        if (customOptions.preauthorizeApiKey) {
            const apiKey = customOptions.preauthorizeApiKey.apiKey;
            const apiKeyValue = customOptions.preauthorizeApiKey.apiKeyValue;
            if (!!apiKey && !!apiKeyValue) {
                const pid = setInterval(() => {
                    const authorize = ui.preauthorizeApiKey(apiKey, apiKeyValue);
                    if (!!authorize) clearInterval(pid);
                }, 500);
            }
        }

        if (customOptions.authAction) {
            ui.authActions.authorize(customOptions.authAction);
        }

        if (customOptions.title) {
            ui.setTitle(customOptions.title);
        }

        if (customOptions.authActions) {
            customOptions.authActions.forEach(authAction => {
                ui.authActions.authorize(authAction);
            });
        }

        if (customOptions.layout) {
            ui.render(customOptions.layout);
        }

        if (customOptions.tagsSorter) {
            ui.tagsSorter = customOptions.tagsSorter;
        }

        if (customOptions.docExpansion) {
            ui.docExpansion = customOptions.docExpansion;
        }

        if (customOptions.defaultModelRendering) {
            ui.defaultModelRendering = customOptions.defaultModelRendering;
        }

        if (customOptions.showExtensions) {
            ui.showExtensions = customOptions.showExtensions;
        }

        if (customOptions.showCommonExtensions) {
            ui.showCommonExtensions = customOptions.showCommonExtensions;
        }

        if (customOptions.validatorUrl) {
            ui.validatorUrl = customOptions.validatorUrl;
        }
    }

    // var ui = SwaggerUIBundle(swaggerOptions);

    window.ui = SwaggerUIBundle(swaggerOptions);

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    // window.ui = SwaggerUIBundle({
    //     // url: "https://petstore.swagger.io/v2/swagger.json",
    //     spec: spec,
    //     url: url,
    //     urls: urls,
    //     dom_id: '#swagger-ui',
    //     deepLinking: true,
    //     presets: [
    //         SwaggerUIBundle.presets.apis,
    //         SwaggerUIStandalonePreset
    //     ],
    //     plugins: [
    //         SwaggerUIBundle.plugins.DownloadUrl
    //     ],
    //     layout: "StandaloneLayout"
    // });

    //</editor-fold>
};