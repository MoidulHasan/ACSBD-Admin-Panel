// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "node:path";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",
  css: ["~/assets/styles/scss/main.scss"],
  modules: ["nuxt-primevue", "@nuxtjs/tailwindcss", "@nuxtjs/eslint-module"],
  primevue: {
    unstyled: true,
    importPT: {
      from: path.resolve(__dirname, "./src/assets/styles/presets/lara/"),
    },
  },
  tailwindcss: {
    exposeConfig: true,
  },
});
