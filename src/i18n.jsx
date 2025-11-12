import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';

i18n
  .use(LanguageDetector) // 👈 add this line
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng:'hi',
    fallbackLng: 'hi', // 👈 fallback to English if language not found

    detection: {
      // 👇 Define language detection order
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // 👈 Persist user language in localStorage
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
