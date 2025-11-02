# Homeros

[![CI](https://github.com/okan/homeros/actions/workflows/ci.yml/badge.svg)](https://github.com/okan/homeros/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/okan/homeros?include_prereleases)](https://github.com/okan/homeros/releases)
[![License](https://img.shields.io/github/license/okan/homeros)](./LICENSE)

A modern Chrome New Tab extension for organizing bookmarks in named slots.

## Features

- 📂 Organize links in named slots
- ✅ TODO list with deadlines
- 🔄 Drag & drop to reorder slots and links
- ☁️ Chrome sync support

## Installation

### From Release (Recommended)

1. Go to the [Releases](https://github.com/okan/homeros/releases) page
2. Download the latest `homeros.zip`
3. Extract the ZIP file to a folder on your computer
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" (toggle in the top right)
6. Click "Load unpacked"
7. Select the extracted folder
8. Open a new tab to see Homeros in action! 🎉

### From Source

```bash
# Clone the repository
git clone https://github.com/okan/homeros.git
cd homeros

# Install dependencies
npm install

# Build for production
npm run build

# Load the 'dist' folder as an unpacked extension in Chrome
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Privacy

Homeros stores data using the Chrome Storage API:

- Locally via `chrome.storage.local`.
- Optionally synced via `chrome.storage.sync` if Chrome sync is enabled on your browser profile.

No external servers, analytics, or network requests are used. The extension requests only the `storage` permission.

## Contributing

Issues and pull requests are welcome. See [Issues](https://github.com/okan/homeros/issues).

## License

MIT. See [LICENSE](./LICENSE) for details.
