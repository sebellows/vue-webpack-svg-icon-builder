const typeOf = require('./typeOf');

const isObject = (value) => typeOf(value) === 'object';

/**
 * Simple, recursive merge strategy for nested objects.
 * Adapted from answer on StackOverflow: https://stackoverflow.com/a/48294910
 *
 * @param {*} target
 * @param  {...any} sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) target[key] = {};
                mergeDeep(target[key], source[key]);
            } else {
                target = { ...target, ...{ [key]: source[key] } };
            }
        }
    }

    return mergeDeep(target, ...sources);
}

module.exports = mergeDeep;
