import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AntdStandaloneProvider } from '@/components/AntdProvider';
import { ToastProvider } from '@/components/Toast';
import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import '@/app/globals.css';

function applyInitialTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    const theme =
      savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system'
        ? savedTheme
        : 'system';
    const actualTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    document.documentElement.setAttribute('data-theme', actualTheme);
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '/about' ? '/about' : '/';
}

function DesktopRouter() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route === '/about' ? <AboutPage /> : <HomePage />;
}

applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AntdStandaloneProvider>
      <ToastProvider>
        <DesktopRouter />
      </ToastProvider>
    </AntdStandaloneProvider>
  </React.StrictMode>
);
