import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// Register Service Worker for Full PWA Offline & Notification Support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[AABHA PWA] Service Worker registered with scope:', reg.scope))
      .catch((err) => console.warn('[AABHA PWA] Service Worker registration failed:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Also register in dev/preview if available
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
