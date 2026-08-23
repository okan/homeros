import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useThemeStore } from './store/useThemeStore';
import { applyTheme } from './themes';
import './index.css';

// Apply the persisted theme before first paint (MV3 CSP forbids inline scripts in index.html)
applyTheme(useThemeStore.getState().theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
