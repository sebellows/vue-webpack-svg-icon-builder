/* eslint-env browser */
const config = require('../config');
const { dedupeClassNames } = require('./dedupe');

// import icons from '../../icons';
// TODO: This is just a hack for getting the icons JSON file from the output directory.
const jsonFile = path.resolve(__dirname, config.output.dir, config.output.jsonFile);
const iconsData = JSON.parse(fs.readFileSync(jsonFile));
const icons = Object.fromEntries(
    Object.entries(iconsData).map(([key, value]) => [
        key,
        new Icon(key, value, context.options.attrs),
    ])
);

/**
 * Replace all HTML elements that have a `data-icon` attribute with SVG markup
 * corresponding to the element's `data-icon` attribute value.
 *
 * @param {Object} attrs
 */
function replace(attrs = {}) {
    if (typeof document === 'undefined') {
        throw new Error('`icon.replace()` only works in a browser environment.');
    }

    const elementsToReplace = document.querySelectorAll('[data-icon]');

    Array.from(elementsToReplace).forEach((element) => replaceElement(element, attrs));
}

/**
 * Replace a single HTML element with SVG markup
 * corresponding to the element's `data-icon` attribute value.
 *
 * @param {HTMLElement} element
 * @param {Object} attrs
 */
function replaceElement(element, attrs = {}) {
    const elementAttrs = getAttrs(element);
    const name = elementAttrs['data-icon'];
    delete elementAttrs['data-icon'];

    const svgString = icons[name].toSvg({
        ...attrs,
        ...elementAttrs,
        ...{ class: dedupeClassNames(attrs.class, elementAttrs.class) },
    });
    const svgDocument = new DOMParser().parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDocument.querySelector('svg');

    element.parentNode.replaceChild(svgElement, element);
}

/**
 * Get the attributes of an HTML element.
 *
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getAttrs(element) {
    return Array.from(element.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});
}

module.exports = replace;
