const doctrine = require('doctrine');
const YAML = require('yaml');
const parser = require('swagger-parser');

const {
    convertGlobPaths,
    extractAnnotations,
    extractYamlFromJsDoc,
    hasEmptyProperty,
    isTagPresentInTags,
    mergeDeep,
} = require('../../utils/swagger.js');

/**
 * Prepare the swagger/openapi specification object.
 * @param {object} options The library input options.
 * @param {object} options.swaggerDefinition The swagger definition object.
 * @returns {object} specObject
 */
function prepareSpecification(options) {
    let version;
    const specObject = options.swaggerDefinition || options.definition;
    const specificationTemplate = {
        v2: ['paths', 'definitions', 'responses', 'parameters', 'securityDefinitions'],
        v3: ['paths', 'definitions', 'responses', 'parameters', 'securityDefinitions', 'components'],
        v4: ['components', 'channels'],
    };

    if (specObject.asyncapi) version = 'v4';
    else if (specObject.openapi) version = 'v3';
    else if (specObject.swagger) version = 'v2';
    else {
        version = 'v2';
        specObject.swagger = '2.0';
    }

    specificationTemplate[version].forEach((prop) => {
        specObject[prop] = specObject[prop] || {};
    });

    specObject.tags = specObject.tags || [];

    return specObject;
}

/**
 * Format the swagger object to the specified formatSpecification.
 * @param {object} specObject The swagger object to formatSpecification.
 * @param {string} ext The file extension (e.g., '.yml', '.yaml').
 * @returns {object|string} Formatted swagger object or YAML string.
 */
function formatSpecification(specObject, ext) {
    if (ext === '.yml' || ext === '.yaml') {
        return YAML.stringify(specObject);
    }
    return specObject;
}

/**
 * Clean the swagger object by removing empty properties.
 * @param {object} specObject The swagger object to cleanSpecification.
 * @returns {object} Cleaned swagger object.
 */
function cleanSpecification(specObject) {
    for (const prop of ['definitions', 'responses', 'parameters', 'securityDefinitions']) {
        if (hasEmptyProperty(specObject[prop])) {
            delete specObject[prop];
        }
    }
    return specObject;
}

/**
 * Finalize the swagger specification by parsing and cleaning it.
 * @param {Object} specObject The swagger object to finalizeSpecification.
 * @param {Object} options The options for finalization.
 * @returns {Object} The finalized specification.
 */
function finalizeSpecification(specObject, options) {
    let finalSpec = specObject;

    parser.parse(specObject, (err, api) => {
        if (!err) {
            finalSpec = api;
        }
    });

    if (finalSpec.openapi) {
        finalSpec = cleanSpecification(finalSpec);
    }

    if (options && options.format) {
        finalSpec = formatSpecification(finalSpec, options.format);
    }

    return finalSpec;
}

/**
 * Organize the swagger object by merging annotations.
 * @param {object} specObject The swagger object to organizeAnnotations.
 * @param {Array<object>} annotations The annotations to merge.
 * @returns {object} Organized swagger object.
 */
function organizeAnnotations(specObject, annotations) {
    for (const annotation of annotations) {
        for (const prop in annotation) {

            if (!specObject[prop]) {
                specObject[prop] = {};
            }

            if (prop === 'x-webhooks') {
                specObject[prop] = mergeDeep(specObject[prop], annotation[prop]);
            }

            if (prop.startsWith('x-')) continue;

            const commonProperties = ['components', 'consumes', 'produces', 'paths', 'schemas', 'securityDefinitions', 'responses', 'parameters', 'definitions', 'channels'];

            if (commonProperties.includes(prop)) {
                for (const definition of Object.keys(annotation[prop])) {
                    if (!specObject[prop][definition]) {
                        specObject[prop][definition] = {};
                    }
                    specObject[prop][definition] = mergeDeep(specObject[prop][definition], annotation[prop][definition]);
                }
            } else if (prop === 'tags') {
                if (!specObject.tags) {
                    specObject.tags = [];
                }
                const { tags } = annotation;

                if (tags instanceof Array) {
                    for (const tag of tags) {
                        if (!isTagPresentInTags(tag, specObject.tags)) {
                            specObject.tags.push(tag);
                        }
                    }
                } else if (!isTagPresentInTags(tags, specObject.tags)) {
                    specObject.tags.push(tags);
                }
            } else {
                specObject.paths[prop] = mergeDeep(specObject.paths[prop], annotation[prop]);
            }
        }
    }

    return specObject;
}

/**
 * Extract specification the swagger object from API annotations and YAML documents.
 * @param {object} options The extraction options.
 * @param {string[]} options.apis The API files to extract annotations from.
 * @param {string} options.encoding The file encoding. Default is 'utf-8'.
 * @param {boolean} options.failOnErrors Whether to fail on errors. Default is false.
 * @returns {object[]} Array of parsed YAML documents.
 * @throws Will throw an error if the input parameters are invalid.
 */
function extractSpecification(options) {
    if (
        !options ||
        !options.apis ||
        options.apis.length === 0 ||
        !options.apis instanceof Array
    ) {
        console.error(
            'Invalid input parameters: options is required, as well as options.apis[]'
        );
        throw new Error(
            'Invalid input parameters: options is required, as well as options.apis[]'
        );
    }

    const yamlDocsAnchors = new Map();
    const yamlDocsErrors = [];
    const yamlDocsReady = [];

    for (const filePath of convertGlobPaths(options.apis)) {
        try {
            const { yaml: yamlAnnotations, jsdoc: jsdocAnnotations } = extractAnnotations(filePath, options.encoding);
            if (yamlAnnotations.length) {
                for (const annotation of yamlAnnotations) {
                    const parsed = YAML.parseDocument(annotation);

                    const anchors = parsed.anchors.getNames();
                    if (anchors.length) {
                        for (const anchor of anchors) {
                            yamlDocsAnchors.set(anchor, parsed);
                        }
                    } else if (parsed.errors && parsed.errors.length) {
                        yamlDocsErrors.push(parsed);
                    } else {
                        yamlDocsReady.push(parsed);
                    }
                }
            }

            if (jsdocAnnotations.length) {
                for (const annotation of jsdocAnnotations) {
                    const jsDocComment = doctrine.parse(annotation, { unwrap: true });
                    for (const doc of extractYamlFromJsDoc(jsDocComment)) {
                        const parsed = YAML.parseDocument(doc, { keepCstNodes: true });

                        if (parsed.anchors && parsed.anchors.getNames().length) {
                            const anchors = parsed.anchors.getNames();
                            for (const anchor of anchors) {
                                yamlDocsAnchors.set(anchor, parsed);
                            }
                        } else if (parsed.errors && parsed.errors.length) {
                            yamlDocsErrors.push(parsed);
                        } else {
                            yamlDocsReady.push(parsed);
                        }
                    }
                }
            }
        } catch (error) {
            if (options.failOnErrors) {
                console.error(`Extraction failed for ${filePath}: ${error.message}`);
                throw new Error(error.message);
            }
        }
    }

    if (yamlDocsErrors.length) {
        for (const docWithErr of yamlDocsErrors) {
            const errsToDelete = [];

            docWithErr.errors.forEach((error, index) => {
                if (error.name === 'YAMLReferenceError') {
                    const refErr = error.message
                        .split('Aliased anchor not found: ')
                        .filter((a) => a)
                        .join('')
                        .split(' at line')[0];

                    const anchor = yamlDocsAnchors.get(refErr);
                    const anchorString = anchor.cstNode.toString();
                    const originalString = docWithErr.cstNode.toString();
                    const readyDocument = YAML.parseDocument(
                        `${anchorString}\n${originalString}`,
                        { keepCstNodes: true }
                    );

                    yamlDocsReady.push(readyDocument);
                    errsToDelete.push(index);
                }
            });

            errsToDelete.sort((a, b) => b - a);

            for (const errIndex of errsToDelete) {
                docWithErr.errors.splice(errIndex, 1);
            }
        }

        const errReport = yamlDocsErrors
            .map(({ errors }) => errors.join('\n'))
            .filter((error) => !!error);

        if (errReport.length) {
            if (options.failOnErrors) {
                console.error(`Extraction failed: ${errReport.join('\n')}`);
                throw new Error(errReport);
            }
            console.warn(
                'Not all input has been accounted for in the final specification.'
            );
            console.info(`Error report:\n${errReport.join('\n')}`);
        }
    }

    return yamlDocsReady.map((doc) => doc.toJSON());
}


module.exports = {
    prepareSpecification,
    finalizeSpecification,
    organizeAnnotations,
    extractSpecification
};