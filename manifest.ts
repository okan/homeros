import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Homeros',
  version: pkg.version,
  description: 'Your "New Tab" page',
  // activeTab and contextMenus show no install warning, so updating doesn't disable the extension
  permissions: ['storage', 'favicon', 'activeTab', 'contextMenus'],
  chrome_url_overrides: {
    newtab: 'index.html',
  },
  action: {
    default_title: 'Save page to Homeros',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  icons: {
    '128': 'icon-128.png',
  },
});
