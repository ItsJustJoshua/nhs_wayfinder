// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        { src: 'https://cdn.userway.org/widget.js', 'data-account': 'mYa2EuuCvg' }
      ]
    }
  },
  css: ['./public/css/style.css']
  
})
