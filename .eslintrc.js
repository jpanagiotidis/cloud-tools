module.exports = {
  "extends": "airbnb",
  "parser": "espree",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "script", //we are not using es6 modules
  },
  "env": {
    "node": true,
  },
  "rules": {
    "strict": ['error', 'global'], //airbnb doesn't use it because it is added automatically from babel
    "import/no-extraneous-dependencies": [
      'error',
      {
        'devDependencies': true,
      },
    ],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],
  },
};
