// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./public/css/style.css'],

  //LANGUAGE TRANSLATION
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English', dir: 'ltr' },
      { code: 'es', file: 'es.json', name: 'Español', dir: 'ltr' },
      { code: 'fr', file: 'fr.json', name: 'Français', dir: 'ltr' },
      { code: 'it', file: 'it.json', name: 'Italiano', dir: 'ltr' },
      { code: 'zh', file: 'zh.json', name: '中文', dir: 'ltr' },
      { code: 'ja', file: 'ja.json', name: '日本語', dir: 'ltr' },
      { code: 'ko', file: 'ko.json', name: '한국어', dir: 'ltr' },
      { code: 'ar', file: 'ar.json', name: 'العربية', dir: 'rtl' },
      { code: 'ur', file: 'ur.json', name: 'اردو', dir: 'rtl' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en'
  }
})
