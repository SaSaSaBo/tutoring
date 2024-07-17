module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
"extends": ["eslint:recommended"],
  root: true,
  env: {
    "node": true,
    "es2021": true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
