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
      'vue/component-tags-order': ['error', {
        order: [ 'script', 'template', 'style' ]
      }],

    'vue/multi-word-component-names': 'off'
  },
  "ignorePatterns": ["src/assets/styles/presets/**"]
};
