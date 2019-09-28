const SVGIconBuilderPlugin = require('./plugin/svg-builder-plugin');

module.exports = {
    assetsDir: 'assets',
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            // Do not use SVGIconBuilderPlugin during HMR. Bad things happen.
            config.plugins.push(new SVGIconBuilderPlugin());
        }
    },
    // chainWebpack: (config) => {
    //     config.module
    //         .rule('svg')
    //         .use('file-loader')
    //         .loader('vue-svg-loader');
    // },
};
