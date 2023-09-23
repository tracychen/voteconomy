module.exports = {
  extends: [
    "eslint:recommended",
    "turbo",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "@typescript-eslint/parser",
  },
  plugins: ["@typescript-eslint"],
};
