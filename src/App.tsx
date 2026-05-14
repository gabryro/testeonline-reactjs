import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { router } from '@/router';
import { queryClient } from '@/config/queryClient';
import { useAppStore } from '@/store/appStore';
import { configService } from '@/services/config.service';
import '@/config/i18n';

function ThemeSync() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  return null;
}

function AppConfigLoader() {
  const { setLimits } = useAppStore();

  useEffect(() => {
    configService.getAppConfig()
      .then((config) => setLimits(config))
      .catch(() => {});
  }, [setLimits]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <AppConfigLoader />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'inherit' },
        }}
      />
    </QueryClientProvider>
  );
}
