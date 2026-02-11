import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from '../locales/en/translation.json';
import afTranslations from '../locales/af/translation.json';
import zuTranslations from '../locales/zu/translation.json';
import xhTranslations from '../locales/xh/translation.json';
import tswanaTranslations from '../locales/tn/translation.json';

// South African languages configuration
const resources = {
  en: {
    translation: enTranslations
  },
  af: {
    translation: afTranslations
  },
  zu: {
    translation: zuTranslations
  },
  xh: {
    translation: xhTranslations
  },
  tn: {
    translation: tswanaTranslations
  }
};

// Language codes for South Africa
const supportedLanguages = ['en', 'af', 'zu', 'xh', 'tn'];

i18n
  // Load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // Learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  // For all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.VITE_DEBUG_MODE === 'true',
    
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    // Supported languages
    supportedLngs: supportedLanguages,

    // Default namespace
    defaultNS: 'translation',

    // Backend configuration for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // React i18next options
    react: {
      useSuspense: false, // Set to true if you want to use suspense
    }
  });

export default i18n;