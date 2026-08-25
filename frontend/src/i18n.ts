import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mrTranslations from './locales/mr.json';

const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem('i18nextLng')) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      mr: { translation: mrTranslations }
    },
    lng: ['en', 'hi', 'mr'].includes(savedLanguage) ? savedLanguage : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
