# Homeros

[![CI](https://github.com/okan/homeros/actions/workflows/ci.yml/badge.svg)](https://github.com/okan/homeros/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/okan/homeros?include_prereleases)](https://github.com/okan/homeros/releases)
[![License](https://img.shields.io/github/license/okan/homeros)](./LICENSE)

A modern Chrome New Tab extension that centralizes bookmarks, tasks, habits, and fast search into a single start page.

## Features

- 📂 Organize bookmarks into named slots with custom icons
- 🧩 Enrich links with descriptions and tags
- 🔎 Search quickly with keyboard navigation (⌘K / Ctrl+K)
- ✅ Track TODOs with optional deadlines and urgency cues
- 🔥 Build daily habits with streak visibility
- ✂️ Store reusable text snippets for quick copy
- 🔄 Drag & drop to reorder slots and links
- 🌓 Dark Mode support
- 💾 Export and import your data
- 💻 All data stored locally on your device

## Usage

- Create slots in edit mode, then add links with titles, URLs, descriptions, and tags.
- Use the top-right actions to search, open tasks, or manage snippets.
- Press ⌘K / Ctrl+K to search and navigate results entirely by keyboard.
- Toggle edit mode to rename slots, change icons, and reorder content.

## Keyboard Shortcuts

- ⌘/Ctrl+K — Open search
- ⌘/Ctrl+E — Toggle edit mode
- ⌘/Ctrl+T — Toggle tasks panel
- Esc — Close overlays

## Installation

### From Release (Recommended)

1. Go to the [Releases](https://github.com/okan/homeros/releases) page
2. Download the latest `homeros.zip`
3. Extract the ZIP file to a folder on your computer
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" (toggle in the top right)
6. Click "Load unpacked"
7. Select the extracted folder
8. Open a new tab to verify Homeros is active

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

## Tech Stack

- **Runtime**: React 18, TypeScript
- **Bundler**: Vite 7 + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **DnD**: @dnd-kit
- **Testing**: Playwright (E2E)
- **CI**: GitHub Actions

## Development

```bash
npm install
npm run dev
```

### Available Scripts

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `npm run dev`         | Start development server        |
| `npm run build`       | Type-check and production build |
| `npm run type-check`  | Run TypeScript type checking    |
| `npm run lint`        | Lint with ESLint                |
| `npm run format`      | Format with Prettier            |
| `npm run test:e2e`    | Run Playwright E2E tests        |
| `npm run test:e2e:ui` | Open Playwright UI mode         |

## Privacy

Homeros stores all data locally on your device:

- Bookmarks, TODOs, and snippets are saved to `chrome.storage.local`.
- Habits are stored in the browser's local storage via Zustand persist.

Homeros does not use external servers, analytics, or network requests. The extension requests only the `storage` permission.

## Contributing

Issues and pull requests are welcome. See [Issues](https://github.com/okan/homeros/issues).

## License

MIT. See [LICENSE](./LICENSE) for details.
