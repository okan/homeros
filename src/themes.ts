// Theme CSS variables live in src/index.css under [data-theme='<id>'] (Stone is :root).
// When adding a theme: add the CSS block there AND a registry entry here. Preview colors
// must match that block's gradient-start/end, bg-content, interactive-primary, text-primary.

export type ThemeId = 'stone' | 'midnight' | 'ocean' | 'forest' | 'rose' | 'amethyst' | 'sepia';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  appearance: 'light' | 'dark';
  preview: {
    gradient: [string, string];
    surface: string;
    accent: string;
    text: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'stone',
    name: 'Stone',
    appearance: 'light',
    preview: {
      gradient: ['rgb(250 248 246)', 'rgb(243 238 234)'],
      surface: 'rgb(255 255 255)',
      accent: 'rgb(143 135 111)',
      text: 'rgb(28 25 23)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    appearance: 'dark',
    preview: {
      gradient: ['rgb(15 15 20)', 'rgb(20 20 35)'],
      surface: 'rgb(24 24 32)',
      accent: 'rgb(163 155 131)',
      text: 'rgb(248 250 252)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    appearance: 'light',
    preview: {
      gradient: ['rgb(246 249 251)', 'rgb(230 240 247)'],
      surface: 'rgb(255 255 255)',
      accent: 'rgb(62 106 145)',
      text: 'rgb(18 32 44)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    appearance: 'dark',
    preview: {
      gradient: ['rgb(15 20 17)', 'rgb(19 29 22)'],
      surface: 'rgb(23 31 26)',
      accent: 'rgb(126 156 122)',
      text: 'rgb(248 250 252)',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    appearance: 'light',
    preview: {
      gradient: ['rgb(251 247 247)', 'rgb(245 233 235)'],
      surface: 'rgb(255 255 255)',
      accent: 'rgb(176 106 118)',
      text: 'rgb(41 26 29)',
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    appearance: 'dark',
    preview: {
      gradient: ['rgb(19 16 26)', 'rgb(27 21 41)'],
      surface: 'rgb(28 24 38)',
      accent: 'rgb(160 140 190)',
      text: 'rgb(248 250 252)',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    appearance: 'light',
    preview: {
      gradient: ['rgb(248 243 232)', 'rgb(240 230 212)'],
      surface: 'rgb(254 250 242)',
      accent: 'rgb(156 124 86)',
      text: 'rgb(56 45 30)',
    },
  },
];

export const DEFAULT_THEME: ThemeId = 'stone';

export const isThemeId = (value: unknown): value is ThemeId =>
  THEMES.some((theme) => theme.id === value);

export const applyTheme = (id: ThemeId): void => {
  document.documentElement.dataset.theme = isThemeId(id) ? id : DEFAULT_THEME;
};
