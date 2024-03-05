// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'src/',
  css: ['~/assets/styles/scss/main.scss'],
  modules: [
    'nuxt-primevue',
    '@nuxtjs/tailwindcss'
  ],
  primevue: {
    unstyled: true,
    importPT: { from: path.resolve(__dirname, './src/assets/styles/presets/lara/') }      //import and apply preset
  },
  tailwindcss: {
    exposeConfig: true,
  },

})
