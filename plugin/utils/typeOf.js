/**
 * Get the type of a value as a string.
 *
 * @param {*} value
 * @return {String}
 *
 * @example
 * ```
 * const obj = {};
 * const objType = typeOf(obj); // 'object'
 * const isObj = !!typeOf(obj) === 'object'; // true
 */
function typeOf(value) {
    function type() {
        return Object.prototype.toString
            .call(this)
            .slice(8, -1)
            .toLowerCase();
    }

    return type.call(value);
}

module.exports = typeOf;
