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
        "FileUpload",
        "Textarea",
        "Dropdown",
        "Toast",
        "Editor",
        "TreeTable",
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
});
