<script setup>
import '../public/css/langSwitcher.css'
const { locales, locale, setLocale } = useI18n()

const onLanguageChange = (event) => {
  setLocale(event.target.value)
}
</script>

<template>
  <div class="language-switcher">
    <label for="lang-select" class="sr-only">{{ $t('choose_language', 'Choose Language') }}</label>
    
    <select id="lang-select" :value="locale" @change="onLanguageChange">
      <option v-for="l in locales" :key="l.code" :value="l.code">
        {{ l.name }} 
      </option>
    </select>
  </div>
</template>