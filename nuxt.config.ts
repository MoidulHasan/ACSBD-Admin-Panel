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
      include: [
        "Button",
        "DataTable",
        "Column",
        "InputText",
        "IconField",
        "InputIcon",
        "Dialog",
        "InputGroup",
        "SelectButton",
        "FileUpload",
        "Textarea",
        "Dropdown",
        "Toast",
        "Editor",
        "TreeTable",
        "Tag",
        "InputNumber",
        "Rating",
      ],
    },
  },

  colorMode: {
    classSuffix: "light",
  },

  veeValidate: {
    autoImports: true,
  },

  runtimeConfig: {
    apiBase: "",

    public: {
      appUrl: "",
    },
  },

  imports: {
    dirs: ["app/interfaces/**"],
  },

  pinia: {
    storesDirs: ["src/stores"],
  },
});
