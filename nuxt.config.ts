// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "node:path";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",
  serverDir: "server/",
  css: ["primeicons/primeicons.css", "~/assets/styles/css/main.css"],
  modules: [
    "nuxt-primevue",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/eslint-module",
  ],
  primevue: {
    unstyled: true,
    ripple: true,
    importPT: {
      from: path.resolve(__dirname, "./src/assets/styles/presets/lara/"),
    },
    components: {
      include: ["Button", "DataTable", "Column", "InputText"],
    },
  },
  colorMode: {
    classSuffix: "",
  },

  runtimeConfig: {
    appUrl: "",
    apiBase: "",
  },
});
