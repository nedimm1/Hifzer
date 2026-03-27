import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import bs from './locales/bs.json';
import tr from './locales/tr.json';
import de from './locales/de.json';
import sq from './locales/sq.json';

export const appLanguages = {
  en: { name: 'English', nativeName: 'English' },
  bs: { name: 'Bosnian', nativeName: 'Bosanski' },
  tr: { name: 'Turkish', nativeName: 'Türkçe' },
  de: { name: 'German', nativeName: 'Deutsch' },
  sq: { name: 'Albanian', nativeName: 'Shqip' },
} as const;

export type AppLanguage = keyof typeof appLanguages;

const resources = {
  en: { translation: en },
  bs: { translation: bs },
  tr: { translation: tr },
  de: { translation: de },
  sq: { translation: sq },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: AppLanguage) => {
  i18n.changeLanguage(lang);
};

export default i18n;
