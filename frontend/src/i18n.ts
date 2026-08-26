import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mrTranslations from './locales/mr.json';
import bnTranslations from './locales/bn.json';
import asTranslations from './locales/as.json';

const savedLanguage = (typeof window !== 'undefined' && (localStorage.getItem('i18nextLng') || localStorage.getItem('aabha_lang'))) || 'en';

const supportedLanguages = ['en', 'hi', 'bn', 'as', 'mr'];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      bn: { translation: bnTranslations },
      as: { translation: asTranslations },
      mr: { translation: mrTranslations }
    },
    lng: supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
