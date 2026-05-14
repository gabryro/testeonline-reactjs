import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const SUPPORTED = ['ro', 'en', 'it', 'fr', 'de', 'es', 'pl', 'pt', 'uk'];

function getPersistedLanguage(): string {
  try {
    const raw = localStorage.getItem('persist:app');
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const lang = typeof obj['language'] === 'string' ? JSON.parse(obj['language'] as string) : null;
      if (typeof lang === 'string' && SUPPORTED.includes(lang)) return lang;
    }
  } catch {}
  const nav = navigator.language?.split('-')[0] ?? '';
  return SUPPORTED.includes(nav) ? nav : 'ro';
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: getPersistedLanguage(),
    fallbackLng: 'ro',
    supportedLngs: SUPPORTED,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
