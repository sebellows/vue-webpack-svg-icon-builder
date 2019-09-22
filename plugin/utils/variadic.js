/**
 * @name variadic
 * @function
 *
 * Check if an array was passed to the rest arguments and extract
 * it if so. Otherwise, return the rest arguments.
 *
 * @see {@link https://github.com/ecrmnn/collect.js|collect.js}
 * @author Daniel Eckermann <http://danieleckermann.com/>
 * @copyright © Daniel Eckermann
 * @license MIT
 *
 * @param {*} args
 * @returns {Array}
 */
module.exports = function(...args) {
    return Array.isArray(args[0]) ? args[0] : args;
};
