import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Homeros',
  version: pkg.version,
  description: 'Your "New Tab" page',
  permissions: ['storage'],
  chrome_url_overrides: {
    newtab: 'index.html',
  },
});
