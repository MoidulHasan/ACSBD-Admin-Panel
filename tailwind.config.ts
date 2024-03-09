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
        "primary-navy-blue-100": "var(--primary-navy-blue-100)",
        "light-gray": "var(--light-gray)",
      },
    },
  },
};
