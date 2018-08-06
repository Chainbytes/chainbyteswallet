module.exports = {
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    parserOptions: {
        ecmaVersion: 2017
    },
    extends: 'eslint:recommended',
    rules: {
        // enable additional rules
        'prefer-const': 'error',
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],

        // override default options for rules from base configurations
        'comma-dangle': ['error', 'always'],
        'no-cond-assign': ['error', 'always'],

        // disable rules from base configurations
        'no-console': 'off',
        'comma-dangle': ['error', 'never']
    }
}