module.exports = {
  root: true,
  extends: ['airbnb-base', 'plugin:json/recommended'],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'import/no-unresolved': ['error', { ignore: ['^https?://', '^da-lit$'] }],
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_heading'] }],
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
};
