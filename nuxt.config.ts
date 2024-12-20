// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "node:path";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",
  serverDir: "server/",

  css: [
    "primeicons/primeicons.css",
    "~/assets/styles/css/main.css",
    "~/assets/styles/css/common.css",
  ],

  modules: [
    "nuxt-primevue",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/eslint-module",
    "@vee-validate/nuxt",
    "@pinia/nuxt",
    "@nuxt/image",
    "nuxt-icons",
  ],

  primevue: {
    unstyled: true,
    ripple: true,
    importPT: {
      from: path.resolve(__dirname, "./src/assets/styles/presets/lara/"),
    },
    composables: {
      include: ["useToast"],
    },
    components: {
      include: "*",
      exclude: ["Chart"],
    },
  },

  colorMode: {
    classSuffix: "light",
  },

  veeValidate: {
    autoImports: true,
  },

  imports: {
    dirs: ["app/interfaces/**"],
  },

  pinia: {
    storesDirs: ["src/stores"],
  },

  runtimeConfig: {
    apiBase: "",

    public: {
      appUrl: "",
    },
  },

  nitro: {
    preset: "vercel",
  },

  ssr: true,

  compatibilityDate: "2024-07-15",
});
