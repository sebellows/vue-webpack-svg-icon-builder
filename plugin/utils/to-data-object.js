const fs = require('fs');
const path = require('path');
const Cheerio = require('cheerio');
const { minify } = require('html-minifier');

/**
 * Get contents between opening and closing `<svg>` tags.
 *
 * @param {string} svg
 * @returns {string}
 */
function getSvgContents(svg) {
    const $ = Cheerio.load(svg);

    return minify($('svg').html(), { collapseWhitespace: true });
}

/**
 * Build an object in the format: `{ <name>: <contents> }`.
 *
 * @param {string} iconDir Input path for the icons directory.
 * @returns {Object}
 */
module.exports = function(iconDir) {
    const svgFiles = fs.readdirSync(iconDir).filter((file) => path.extname(file) === '.svg');

    return svgFiles
        .map((svgFile) => {
            const name = path.basename(svgFile, '.svg');
            const svg = fs.readFileSync(path.join(iconDir, svgFile));
            const contents = getSvgContents(svg);
            return { name, contents };
        })
        .reduce((icons, { name, contents }) => {
            icons[name] = contents;
            return icons;
        }, {});
};
