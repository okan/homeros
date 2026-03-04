<p align="center">
  <img src="public/icon-128.png" alt="Homeros" width="80" height="80" />
</p>

<h1 align="center">Homeros</h1>

<p align="center">
  Your <strong>New Tab</strong> page — beautifully organized bookmarks, todos, habits, and more.
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/tag/okan/homeros?label=version&style=flat-square" alt="Version" />
  <img src="https://img.shields.io/github/actions/workflow/status/okan/homeros/ci.yml?branch=main&style=flat-square&label=CI" alt="CI" />
  <img src="https://img.shields.io/github/license/okan/homeros?style=flat-square" alt="License" />
</p>

---

## Features

- **Slot-based bookmarks** — Group links into customizable slots with icons. Add titles, descriptions, and tags to each link.
- **Drag & drop** — Reorder slots and links freely with smooth drag-and-drop powered by dnd-kit.
- **Quick search** — Press `⌘K` to instantly find bookmarks and snippets. Navigate results with keyboard.
- **Todo panel** — Slide-out task list with deadline tracking and visual urgency indicators. Open with `⌘T`.
- **Daily habit tracker** — Track streaks, view a 7-day history, and celebrate completions with confetti.
- **Text snippets** — Store frequently used texts and copy them instantly from search or the snippet manager.
- **Dark & light themes** — Toggle between themes from settings.
- **Data export & import** — Back up everything to JSON. Restore with replace or merge modes.
- **Keyboard shortcuts** — `⌘K` search, `⌘E` edit mode, `⌘T` todo panel, `Esc` to dismiss.

## Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Framework   | React 18, TypeScript                 |
| Build       | Vite 7, @crxjs/vite-plugin           |
| Styling     | TailwindCSS 3, PostCSS               |
| State       | Zustand                              |
| Drag & Drop | @dnd-kit                             |
| Icons       | Lucide React                         |
| Date        | date-fns                             |
| Testing     | Playwright (E2E)                     |
| Quality     | ESLint, Prettier, Husky, lint-staged |
| CI/CD       | GitHub Actions                       |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
npm install
npm run dev
```

### Load as Chrome Extension

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

## Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start Vite dev server               |
| `npm run build`       | Type-check and build for production |
| `npm run preview`     | Preview production build            |
| `npm run type-check`  | Run TypeScript type checking        |
| `npm run lint`        | Run ESLint                          |
| `npm run format`      | Format with Prettier                |
| `npm run test:e2e`    | Run Playwright E2E tests            |
| `npm run test:e2e:ui` | Run E2E tests with UI               |

## Project Structure

```
src/
├── components/     # React components (modals, panels, grid, toolbar, etc.)
├── hooks/          # Custom hooks (storage, shortcuts, onboarding)
├── store/          # Zustand stores (bookmarks, todos, habits, snippets, theme)
├── types/          # TypeScript type definitions
├── utils/          # Helpers (URL validation, data export, favicon, deadline)
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on development setup, code style, and pull requests.

## License

[MIT](LICENSE)
