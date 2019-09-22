const dedupeClassNames = require('./utils/dedupe');
const DEFAULT_ATTRS = require('./default-attrs.json');

/**
 * Convert attributes object to string of HTML attributes.
 * @param {Object} attrs
 * @returns {string}
 */
function attrsToString(attrs) {
    return Object.keys(attrs)
        .map((key) => `${key}="${attrs[key]}"`)
        .join(' ');
}

class Icon {
    constructor(name, contents, attrs = {}) {
        this.name = name;
        this.contents = contents;
        // this.tags = tags;
        this.attrs = { class: `icon icon-${name}`, ...attrs };

        return this;
    }

    /**
     * Create an SVG string.
     * @param {Object} attrs
     * @returns {string}
     */
    toSvg(attrs = {}) {
        const combinedAttrs = {
            ...this.attrs,
            ...attrs,
            ...{ class: dedupeClassNames(this.attrs.class, attrs.class) },
        };

        return `<svg ${attrsToString(combinedAttrs)}>${this.contents}</svg>`;
    }

    /**
     * Return string representation of an `Icon`.
     * @returns {string}
     */
    toString() {
        return this.contents;
    }
}

module.exports = Icon;
