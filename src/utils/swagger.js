const fs = require('fs');
const { extname } = require('path');
const glob = require('glob');
const mergeWith = require('lodash.mergewith');

/**
 * Converts an array of globs to full paths.
 * @param {string[]} globs - Array of globs and/or normal paths.
 * @returns {string[]} Array of fully-qualified paths.
 */
function convertGlobPaths(globs) {
    return globs
        .map(globString => glob.sync(globString))
        .reduce((acc, current) => acc.concat(current), []);
}

/**
 * Checks if any properties of the input object are empty objects.
 * @param {object} obj - The object to check.
 * @returns {boolean} True if there are empty properties, false otherwise.
 */
function hasEmptyProperty(obj) {
    if (!obj) return false;

    return Object.values(obj)
        .filter(value => typeof value === 'object' && value !== null)
        .every(value => Object.keys(value).length === 0);
}

/**
 * Extracts YAML descriptions from JSDoc comments with `@swagger`/`@openapi` annotations.
 * @param {object} jsDocComment - Single item of JSDoc comments parsed by doctrine.
 * @returns {string[]} YAML parts extracted from JSDoc comments.
 */
function extractYamlFromJsDoc(jsDocComment) {
    return jsDocComment.tags
        .filter(tag => tag.title === 'swagger' || tag.title === 'openapi')
        .map(tag => tag.description);
}

/**
 * Extracts annotations (JSDoc and YAML) from a file.
 * @param {string} filePath - Path to the file to be processed.
 * @param {string} [encoding='utf8'] - File encoding.
 * @returns {Promise<{jsdoc: string[], yaml: string[]}>} JSDoc comments and YAML contents.
 */
function extractAnnotations(filePath, encoding = 'utf8') {
    const fileContent =  fs.readFileSync(filePath, { encoding });
    const ext = extname(filePath);
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm;
    const csDocRegex = /###([\s\S]*?)###/gm;
    const yaml = [];
    const jsdoc = [];
    let regexResults = null;

    switch (ext) {
        case '.yml':
        case '.yaml':
            yaml.push(fileContent);
            break;
        case '.coffee':
            regexResults = fileContent.match(csDocRegex) || [];
            for (const result of regexResults) {
                const part = result.replace(/###/g, '/**').replace(/###/g, '*/');
                jsdoc.push(part);
            }
            break;
        default:
            regexResults = fileContent.match(jsDocRegex) || [];
            jsdoc.push(...regexResults);
    }

    return { yaml, jsdoc };
}

/**
 * Checks if a tag is present in the provided tags array.
 * @param {object} tag - The tag to check.
 * @param {string} tag.name - The name of the tag.
 * @param {object[]} tags - Array of tags to search in.
 * @returns {boolean} True if the tag is present, false otherwise.
 */
function isTagPresentInTags(tag, tags) {
    // return tags.some(targetTag => targetTag.name === tag.name);
    const matches = tags.find(targetTag => targetTag.name === tag.name);
    if (matches) {
        return true;
    }
    return false;
}

/**
 * Validates the input options for the Swagger/OpenAPI generator.
 * @param {object} options - The options to validate.
 * @throws Will throw an error if the options are invalid.
 * @returns {object} The validated options.
 */
function validateOptions(options) {
    if (!options) {
        throw new Error(`'options' parameter is required!`);
    }

    const def = options.swaggerDefinition || options.definition;

    if (!def) {
        throw new Error(
            `'options.swaggerDefinition' or 'options.definition' is required!`
        );
    }

    if (!def.info || !def.info.title || !def.info.version) {
        throw new Error(
            `Swagger definition info object ('options.swaggerDefinition.info') requires title and version properties!`
        );
    }

    if (!options.apis || !Array.isArray(options.apis)) {
        throw new Error(`'options.apis' is required and it should be an array!`);
    }

    return options;
}

/**
 * Recursively deep-merges two objects, ignoring null values in the second object.
 * @param {object} first - The first object to merge.
 * @param {object} second - The second object to merge.
 * @returns {object} The merged object.
 */
function mergeDeep(first, second) {
    return mergeWith({}, first, second, (a, b) => (b === null ? a : undefined));
}

/**
 * Trims the query string and removes the '?' character at the beginning.
 * @param {String} query - Query string to be trimmed
 * @returns {String} Trimmed query string
 */
function trimQuery(query) {
    return query && query.split('?')[1];
}

module.exports = {
    convertGlobPaths,
    hasEmptyProperty,
    extractYamlFromJsDoc,
    extractAnnotations,
    isTagPresentInTags,
    validateOptions,
    mergeDeep,
    trimQuery,
};