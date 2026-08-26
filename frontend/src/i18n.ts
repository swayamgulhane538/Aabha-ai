import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mrTranslations from './locales/mr.json';
import bnTranslations from './locales/bn.json';
import asTranslations from './locales/as.json';

const rawSavedLanguage =
  (typeof window !== 'undefined' &&
    (localStorage.getItem('aabha_lang') || localStorage.getItem('i18nextLng'))) ||
  'en';

const normalizedLang = rawSavedLanguage.split('-')[0].toLowerCase();
const validLangs = ['en', 'hi', 'bn', 'as', 'mr'];
const initialLang = validLangs.includes(normalizedLang) ? normalizedLang : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      'en-US': { translation: enTranslations },
      'en-IN': { translation: enTranslations },
      hi: { translation: hiTranslations },
      'hi-IN': { translation: hiTranslations },
      bn: { translation: bnTranslations },
      'bn-IN': { translation: bnTranslations },
      as: { translation: asTranslations },
      'as-IN': { translation: asTranslations },
      mr: { translation: mrTranslations },
      'mr-IN': { translation: mrTranslations }
    },
    lng: initialLang,
    fallbackLng: 'en',
    load: 'languageOnly',
    supportedLngs: ['en', 'hi', 'bn', 'as', 'mr', 'en-US', 'en-IN', 'hi-IN', 'mr-IN', 'bn-IN', 'as-IN'],
    nonExplicitSupportedLngs: true,
    lowerCaseLng: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
