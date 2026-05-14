import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { router } from '@/router';
import { useAppSelector } from '@/store/hooks';
import { useGetAppConfigQuery } from '@/store/api/configApi';
import i18n from '@/config/i18n';

function ThemeSync() {
  const theme = useAppSelector((s) => s.app.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);
  return null;
}

function LanguageSync() {
  const language = useAppSelector((s) => s.app.language);
  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [language]);
  return null;
}

function AppConfigLoader() {
  useGetAppConfigQuery();
  return null;
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <LanguageSync />
      <AppConfigLoader />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'inherit' },
        }}
      />
    </>
  );
}
