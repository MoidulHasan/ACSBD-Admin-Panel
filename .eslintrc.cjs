module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended"],
  plugins: [],
  rules: {
    // "indent": ["error", 4],
      'vue/component-tags-order': ['error', {
        order: [ 'script', 'template', 'style' ]
      }],
  },
  "ignorePatterns": ["src/assets/styles/presets/**"]
};
