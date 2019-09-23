const fs = require('fs');
const path = require('path');

const Icon = require('./icon');
const config = require('./config');

const mergeDeep = require('./utils/mergeDeep');
const { mkdirpAsync } = require('./utils/async-fs');
const optimize = require('./utils/optimize');
const toDataObject = require('./utils/to-data-object');

class SVGIconBuilderPlugin {
    constructor(options = {}) {
        // Merge custom options with defaults.
        this.options = mergeDeep(config, options);

        const { dir: inputDir, iconDir: inputIconDir } = this.options.input;
        const { dir: outputDir, iconDir: outputIconDir } = this.options.output;

        this.outputPath = path.resolve(__dirname, outputDir);
        this.inputIconDir = path.resolve(__dirname, inputDir, inputIconDir);
        this.outputIconDir = path.resolve(__dirname, outputDir, outputIconDir);
    }

    /**
     * Process all of the SVG icons in the `src` directory using svgo to optimize.
     *
     * @return {Promise}
     */
    async processSvgs() {
        console.log(`Processing SVG files from '${this.inputIconDir}'...`);

        return new Promise((resolve, reject) => {
            fs.readdirSync(this.inputIconDir)
                .filter((icon) => path.extname(icon) === '.svg')
                .forEach(async (svgFile) => {
                    const filePath = path.join(this.inputIconDir, svgFile);
                    const svg = fs.readFileSync(filePath);

                    await optimize(svg, this.options.plugins).then((svg) =>
                        fs.writeFileSync(filePath, svg, 'utf8', (err) => {
                            if (err) console.error(err);
                            console.log(`SVG icons JSON file saved to '${jsonFilePath}'`);
                        })
                    );
                });
            resolve(this);
        });
    }

    /**
     * Generate a JSON file containing the configuration of all of the icons.
     *
     * @param {SVGIconBuilderPlugin} context The WebPack registered instance of the plugin.
     * @return {Promise}
     */
    generateIconsJSON(context) {
        console.log(`Building SVG icons JSON file in '${this.outputIconDir}'...`);

        const { jsonFile } = context.options.output;

        return new Promise((resolve, reject) => {
            const iconsMap = toDataObject(this.inputIconDir);
            const jsonFilePath = `${this.outputPath}/${jsonFile}`;

            fs.writeFileSync(jsonFilePath, JSON.stringify(iconsMap, null, 2), 'utf8', (err) => {
                if (err) console.error(err);
                console.log(`SVG icons JSON file saved to '${jsonFilePath}'`);
            });

            resolve(context);
        });
    }

    /**
     * Build an SVG sprite sheet containing SVG symbols.
     *
     * @param {SVGIconBuilderPlugin} context The WebPack registered instance of the plugin.
     * @return {Promise}
     */
    generateSprite(context) {
        console.log(`Building ${context.options.output.spriteSheet}...`);

        return new Promise((resolve, reject) => {
            const { attrs, output, useSprite } = context.options;
            const { jsonFile, spriteSheet } = output;
            const { xmlns, ...iconAttrs } = attrs;
            const icons = JSON.parse(fs.readFileSync(`${this.outputPath}/${jsonFile}`));
            const attrStr = Object.keys(iconAttrs)
                .map((attr) => `${attr}="${attrs[attr]}"`)
                .join(' ');
            const wrapperAttrs = `xmlns="${xmlns}" style="display:none;"`;

            if (useSprite) {
                const symbols = Object.keys(icons)
                    .map((icon) => `<symbol id="${icon}" ${attrStr}>${icons[icon]}</symbol>`)
                    .join('');

                const spriteWrapper = `<svg ${wrapperAttrs}><defs>${symbols}</defs></svg>`;

                fs.writeFileSync(
                    `${this.outputPath}/${spriteSheet}`,
                    spriteWrapper,
                    'utf8',
                    (err) => {
                        if (err) console.error(err);
                        console.log(`SVG Sprite saved to `);
                    }
                );
            }
            resolve(context);
        });
    }

    /**
     * Regenerate and optimize all of the SVG icons using svgo.
     *
     * @param {SVGIconBuilderPlugin} context The WebPack registered instance of the plugin.
     * @return {Promise}
     */
    generateSvgs(context) {
        return new Promise((resolve, reject) => {
            const icons = this._getIconsFromJSON(context);
            console.log(`Building SVGs in '${this.outputIconDir}'...`);

            Object.keys(icons).forEach((name) => {
                const svg = icons[name].toSvg();
                fs.writeFileSync(path.join(this.outputIconDir, `${name}.svg`), svg);
            });
            resolve();
        });
    }

    _getIconsFromJSON(context) {
        const jsonFile = `${this.outputPath}/${context.options.output.jsonFile}`;
        const iconsData = JSON.parse(fs.readFileSync(jsonFile));

        return Object.fromEntries(
            Object.entries(iconsData).map(([key, value]) => [
                key,
                new Icon(key, value, context.options.attrs),
            ])
        );
    }

    /**
     * Create all of the files we want output to the `dist` directory.
     *
     * @return {*}
     */
    async make() {
        try {
            await this.processSvgs();
            await this.generateIconsJSON(this);
            await this.generateSprite(this);
            return await this.generateSvgs(this);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Fulfill the WebPack plugin interface.
     *
     * @param {Compiler} compiler - Supplied by WebPack.
     */
    apply(compiler) {
        // Access the assets once they have been assembled
        compiler.hooks.emit.tapPromise('SVGIconBuilderPlugin', async (compilation, callback) => {
            try {
                const { dir, jsonFile, spriteSheet } = this.options.output;
                const jsonFilePath = path.resolve(__dirname, dir, jsonFile);
                const spriteSheetPath = path.resolve(__dirname, dir, spriteSheet);

                await mkdirpAsync(this.outputIconDir);
                await mkdirpAsync(jsonFilePath);
                await mkdirpAsync(spriteSheetPath);
                await this.make();

                // Now everything is done, so call the callback without anything in it
                callback();
            } catch (err) {
                // if at any point we hit a snag, pass the error on to webpack
                callback(err);
            }
        });
    }
}

module.exports = SVGIconBuilderPlugin;
