module.exports = {
    root: true,

    env: {
        node: true
    },

    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'vue/no-unused-components': 'off',
        'vue/no-unused-vars': 'off',
        'prettier/prettier': 'warn'
    },

    parserOptions: {
        parser: 'babel-eslint'
    },

    extends: [
        'plugin:vue/recommended',
        'eslint:recommended',
        'prettier/vue',
        'plugin:prettier/recommended'
    ]
};
