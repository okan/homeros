import { Check } from 'lucide-react';
import { THEMES, type ThemeDefinition, type ThemeId } from '../themes';
import { useThemeStore } from '../store/useThemeStore';

export const ThemePicker = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
      {THEMES.map((t) => (
        <ThemeCard key={t.id} theme={t} selected={t.id === theme} onSelect={setTheme} />
      ))}
    </div>
  );
};

interface ThemeCardProps {
  theme: ThemeDefinition;
  selected: boolean;
  onSelect: (id: ThemeId) => void;
}

const ThemeCard = ({ theme, selected, onSelect }: ThemeCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={() => onSelect(theme.id)}
    className={`relative rounded-control border p-2 text-left transition-colors btn-press ${
      selected
        ? 'border-interactive-primary ring-1 ring-interactive-primary'
        : 'border-border-element hover:bg-bg-wash'
    }`}
  >
    {/* Inline styles on purpose: Tailwind tokens reflect the ACTIVE theme,
        each card must render its own palette */}
    <div
      className="h-14 rounded-content p-1.5 mb-2"
      style={{
        background: `linear-gradient(135deg, ${theme.preview.gradient[0]}, ${theme.preview.gradient[1]})`,
      }}
    >
      <div
        className="h-full rounded-[4px] p-1.5 flex flex-col gap-1 shadow-card-sm"
        style={{ background: theme.preview.surface }}
      >
        <div className="h-1.5 w-3/5 rounded-full" style={{ background: theme.preview.accent }} />
        <div className="h-1 w-4/5 rounded-full opacity-60" style={{ background: theme.preview.text }} />
        <div className="h-1 w-2/3 rounded-full opacity-30" style={{ background: theme.preview.text }} />
      </div>
    </div>
    <span className="text-accent font-medium text-text-primary">{theme.name}</span>
    {selected && (
      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-interactive-primary flex items-center justify-center">
        <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />
      </span>
    )}
  </button>
);
