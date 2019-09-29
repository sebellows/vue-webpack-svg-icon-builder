const fs = require('fs');
const path = require('path');

const Icon = require('./icon');
const config = require('./config');
const vueTmpl = require('./templates/vue-component');
const collectionTmpl = require('./templates/collection');

const mergeDeep = require('./utils/mergeDeep');
const { mkdirpAsync } = require('./utils/async-fs');
const optimize = require('./utils/optimize');
const toDataObject = require('./utils/to-data-object');

class SVGIconBuilderPlugin {
    constructor(options = {}) {
        // Merge custom options with defaults.
        this.options = mergeDeep(config, options);
        this._iconsData = {};
        this._svgSprite = '';

        const { dir: inputDir, iconDir: inputIconDir } = this.options.input;
        const { dir: outputDir, iconDir: outputIconDir } = this.options.output;

        this.outputPath = path.resolve(__dirname, outputDir);
        this.inputIconDir = path.resolve(__dirname, inputDir, inputIconDir);
        this.outputIconDir = path.resolve(__dirname, outputDir, outputIconDir);
    }

    get iconsData() {
        return this._iconsData;
    }
    set iconsData(data) {
        this._iconsData = data;
    }

    get svgSprite() {
        return this._svgSprite;
    }
    set svgSprite(value) {
        this._svgSprite = value;
    }

    _maybeSetSprite() {
        if (this.svgSprite === '') {
            const { attrs, output } = this.options;
            const { jsonFile } = output;
            const { xmlns, ...iconAttrs } = attrs;
            const icons = JSON.parse(fs.readFileSync(`${this.outputPath}/${jsonFile}`));
            const attrStr = Object.keys(iconAttrs)
                .map((attr) => `${attr}="${iconAttrs[attr]}"`)
                .join(' ');
            const wrapperAttrs = `xmlns="${xmlns}" style="display:none;"`;

            const symbols = Object.keys(icons)
                .map((icon) => `<symbol id="${icon}" ${attrStr}>${icons[icon]}</symbol>`)
                .join('');

            this.svgSprite = `<svg ${wrapperAttrs}><defs>${symbols}</defs></svg>`;
        }
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

        const { jsonFile } = this.options.output;

        return new Promise((resolve, reject) => {
            this.iconsData = toDataObject(this.inputIconDir);
            const jsonFilePath = `${this.outputPath}/${jsonFile}`;

            fs.writeFileSync(
                jsonFilePath,
                JSON.stringify(this.iconsData, null, 2),
                'utf8',
                (err) => {
                    if (err) console.error(err);
                    console.log(`SVG icons JSON file saved to '${jsonFilePath}'`);
                }
            );

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
            resolve(context);
        });
    }

    _getIconsFromJSON(context) {
        const jsonFile = `${this.outputPath}/${this.options.output.jsonFile}`;
        const iconsData = JSON.parse(fs.readFileSync(jsonFile));

        return Object.fromEntries(
            Object.entries(iconsData).map(([key, value]) => [
                key,
                new Icon(key, value, this.options.attrs),
            ])
        );
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
            this._maybeSetSprite();
            const spritePath = `${this.outputPath}/${this.options.output.spriteSheet}`;

            fs.writeFileSync(spritePath, this.svgSprite, 'utf8', (err) => {
                if (err) console.error(err);
                console.log(`SVG Sprite saved to ${spritePath}`);
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
    generateVueComponent(context) {
        console.log(`Building ${context.options.output.componentFile}...`);
        const { componentFile, componentsPath } = this.options.output;

        return new Promise((resolve, reject) => {
            this._maybeSetSprite();
            const vueComponent = vueTmpl(this.svgSprite);
            const vueComponentsPath = path.join(__dirname, componentsPath, componentFile);

            fs.writeFileSync(vueComponentsPath, vueComponent, 'utf8', (err) => {
                if (err) console.error(err);
                console.log(`SvgSprite component saved to ${vueComponentsPath}`);
            });
            resolve(context);
        });
    }

    generateCollection(context) {
        return new Promise((resolve, reject) => {
            console.log(`Building collection.html in root directory...`);

            this._maybeSetSprite();
            const ids = Object.keys(this.iconsData);
            const collection = collectionTmpl(this.svgSprite, ids);
            const collectionPath = path.join(__dirname, '../collection.html');

            fs.writeFileSync(collectionPath, collection, 'utf8', (err) => {
                if (err) console.error(err);
                console.log(`Collection HTML saved to ${collectionPath}`);
            });
            resolve(context);
        });
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
            if (this.options.sprite) {
                await this.generateSprite(this);
            }
            if (this.options.component) {
                await this.generateVueComponent(this);
            }
            if (this.options.demo) {
                await this.generateCollection(this);
            }

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
        compiler.hooks.emit.tapAsync('SVGIconBuilderPlugin', async (compilation, callback) => {
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
                console.log('apply', callback);
                console.error(err);
                // if at any point we hit a snag, pass the error on to webpack
                // callback(err);
            }
        });
    }
}

module.exports = SVGIconBuilderPlugin;
