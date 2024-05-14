module.exports = {
  content: [
    "./src/assets/styles/presets/**/*.{js,vue,ts}",
    "./src/components/**/*.{js,vue,ts}",
    "./src/layouts/**/*.vue",
    "./src/pages/**/*.vue",
    "./src/plugins/**/*.{js,ts}",
    "./src/app.vue",
    "./src/error.vue",
  ],

  theme: {
    screens: {
      "2xsm": "375px",
      xsm: "425px",
      "3xl": "2000px",
    },
    extend: {
      colors: {
        "primary-color-envitect-sam-blue":
          "var(--primary-color-envitect-sam-blue)",
        "primary-color-navy-blue": "var(--primary-color-navy-blue)",
        "color-light-gray": "var(--color-light-gray)",
        "color-light-gray-secondary": "var(--color-light-gray-secondary)",
      },
    },
  },
  darkMode: "class",
};
