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
        this.input = this.options.input;
        this.output = this.options.output;
        this.outputPath = path.resolve(__dirname, this.output.dir);
        this.inputIconDir = path.resolve(__dirname, this.input.dir, this.input.iconDir);
        this.outputIconDir = path.resolve(__dirname, this.output.dir, this.output.iconDir);
    }

    /**
     * Process all of the SVG icons in the `src` directory using svgo to optimize.
     *
     * @return {Promise}
     */
    async processSvgs() {
        console.log(`Processing SVG files from ${this.input.dir}/${this.input.iconDir}...`);

        return new Promise((resolve, reject) => {
            fs.readdirSync(this.inputIconDir)
                .filter((icon) => path.extname(icon) === '.svg')
                .forEach((svgFile) => {
                    const filePath = path.join(this.inputIconDir, svgFile);
                    const svg = fs.readFileSync(filePath);

                    optimize(svg, this.options.plugins).then((svg) =>
                        fs.writeFileSync(filePath, svg)
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
        const { dir, jsonFile } = context.options.output;
        const outputDir = path.resolve(__dirname, dir, jsonFile);

        return new Promise((resolve, reject) => {
            const iconsMap = toDataObject(this.inputIconDir);

            fs.writeFileSync(outputDir, JSON.stringify(iconsMap, null, 2));

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
            const spriteFile = `${this.outputPath}/${spriteSheet}`;

            if (useSprite) {
                const symbols = Object.keys(icons)
                    .map((icon) => `<symbol id="${icon}" ${attrStr}>${icons[icon]}</symbol>`)
                    .join('');

                const spriteWrapper = `<svg ${wrapperAttrs}><defs>${symbols}</defs></svg>`;

                fs.writeFileSync(spriteFile, spriteWrapper, 'utf8', (err) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log(`SVG Sprite saved to `);
                });
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
            Object.entries(iconsData).map(([key, value]) => {
                return [key, new Icon(key, value, context.options.attrs)];
            })
        );
    }

    /**
     * Create all of the files we want output to the `dist` directory.
     *
     * @return {*}
     */
    async make() {
        console.log('make?');
        const context = await this.processSvgs();
        const icons = await this.generateIconsJSON(context);
        const sprite = await this.generateSprite(icons);
        const svgs = await this.generateSvgs(sprite);
        return svgs;
    }

    /**
     * Fulfill the WebPack plugin interface.
     *
     * @param {Compiler} compiler - Supplied by WebPack.
     */
    apply(compiler) {
        // Access the assets once they have been assembled
        const onEmit = async (compilation, callback) => {
            try {
                const { output } = this.options;

                // this.inputIconDir = path.resolve(__dirname, input.dir, input.iconDir);
                // this.outputIconDir = path.resolve(__dirname, output.dir, output.iconDir);
                this.jsonFile = path.resolve(__dirname, output.dir, output.jsonFile);
                this.spriteSheet = path.resolve(__dirname, output.dir, output.spriteSheet);
                console.log('options', output, this.jsonFile);

                await mkdirpAsync(this.outputIconDir);
                await mkdirpAsync(this.jsonFile);
                await mkdirpAsync(this.spriteSheet);
                await this.make();

                // Now everything is done, so call the callback without anything in it
                callback();
            } catch (err) {
                // if at any point we hit a snag, pass the error on to webpack
                callback(err);
            }
        };

        // Check if the webpack 4 plugin API is available
        if (compiler.hooks) {
            // Register emit event listener for webpack 4
            compiler.hooks.emit.tapAsync('SVGIconBuilderPlugin', onEmit);
        } else {
            // Register emit event listener for older webpack versions
            compiler.plugin('emit', onEmit);
        }
    }
}

module.exports = SVGIconBuilderPlugin;