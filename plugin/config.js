// Default options.
module.exports = {
    input: {
        dir: '../src/assets',
        iconDir: 'icons',
    },
    output: {
        dir: '../src/assets',
        iconDir: 'img',
        jsonFile: 'svg-icons.json',
        spriteSheet: 'svg-icons-sprite.svg',
    },
    plugins: [
        { cleanupIDs: false },
        { collapseGroups: true },
        { convertPathData: true },
        { convertShapeToPath: true },
        { convertStyleToAttrs: true },
        { convertTransform: true },
        { mergePaths: false },
        { removeAttrs: { attrs: '(fill|stroke.*)' } },
        { removeDesc: true },
        { removeDimensions: true },
        { removeTitle: true },
    ],
    attrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 32,
        height: 32,
        viewBox: '0 0 32 32',
        fill: 'currentColor',
        stroke: 'none',
        'stroke-width': 0,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    },
    // maxConcurrency: CPUS().length,
    useSprite: true,
};
