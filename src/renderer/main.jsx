import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n/index.jsx';
import App from './app/App.jsx';
import './styles/global.css';

const initLoader = document.querySelector('.init-loader');
if (initLoader) {
  initLoader.style.opacity = '0';
  initLoader.style.transition = 'opacity 0.2s ease';
  setTimeout(() => initLoader.remove(), 200);
}

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
