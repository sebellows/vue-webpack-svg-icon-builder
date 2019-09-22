const SVGIconBuilderPlugin = require('./plugin/svg-builder-plugin');

module.exports = {
    assetsDir: 'assets',
    configureWebpack: {
        plugins: [new SVGIconBuilderPlugin()],
    },
};
