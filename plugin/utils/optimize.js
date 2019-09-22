const SVGO = require('svgo');
const Cheerio = require('cheerio');
const { format } = require('prettier');

/**
 * Optimize SVG with `svgo`.
 *
 * @param {string} svg - An SVG string.
 * @returns {Promise<string>}
 */
function svgoOptimize(svg, plugins) {
    const svgo = new SVGO({ plugins: plugins });

    return new Promise((resolve) => {
        svgo.optimize(svg, ({ data }) => resolve(data));
    });
}

/**
 * Set default attibutes on SVG.
 *
 * @param {string} svg - An SVG string.
 * @returns {Promise<string>}
 */
function setAttrs(svg, attrs) {
    return new Promise((resolve, reject) => {
        const $ = Cheerio.load(svg);

        Object.keys(attrs).forEach((key) => {
            $('svg').attr(key, attrs[key]);
        });

        resolve($('body').html());
    });
}

/**
 * Process SVG string.
 *
 * @param {string} svg - An SVG string.
 * @param {Promise<string>}
 */
const optimize = async (svg, plugins, attrs) => {
    let svgText = await svgoOptimize(svg, plugins);
    svgText = await setAttrs(svgText, attrs);

    return new Promise((resolve, reject) => {
        // Configure Prettier to remove semicolons so it doesn't confuse HTML for JSX.
        const result = format(svgText, { semi: false });
        resolve(result);
    });
};

module.exports = optimize;
