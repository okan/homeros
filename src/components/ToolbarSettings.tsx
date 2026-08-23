import { TOOLBAR_BUTTONS, useToolbarStore } from '../store/useToolbarStore';
import { useSnippetStore } from '../store/useSnippetStore';

export const ToolbarSettings = () => {
  const snippetsEnabled = useSnippetStore((state) => state.settings.enabled);
  const showLabels = useToolbarStore((state) => state.showLabels);
  const visibleButtons = useToolbarStore((state) => state.visibleButtons);
  const setShowLabels = useToolbarStore((state) => state.setShowLabels);
  const toggleButton = useToolbarStore((state) => state.toggleButton);

  const modeButtonClass = (selected: boolean) =>
    `flex-1 px-3 py-2 rounded-control border text-value font-medium transition-colors ${
      selected
        ? 'border-interactive-primary bg-interactive-primary/10 text-interactive-primary'
        : 'border-border-element text-text-secondary hover:bg-bg-wash'
    }`;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          aria-pressed={!showLabels}
          onClick={() => setShowLabels(false)}
          className={modeButtonClass(!showLabels)}
        >
          Icon only
        </button>
        <button
          type="button"
          aria-pressed={showLabels}
          onClick={() => setShowLabels(true)}
          className={modeButtonClass(showLabels)}
        >
          Icon + text
        </button>
      </div>

      <div className="space-y-1">
        {TOOLBAR_BUTTONS.map((button) => {
          const disabled = button.id === 'snippets' && !snippetsEnabled;
          return (
            <label
              key={button.id}
              className={`flex items-center justify-between p-2 rounded-control border border-border-element transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-wash cursor-pointer'
              }`}
            >
              <span className="text-value text-text-primary">
                {button.label}
                {disabled && (
                  <span className="text-accent text-text-placeholder ml-2">feature disabled</span>
                )}
              </span>
              <input
                type="checkbox"
                checked={visibleButtons[button.id]}
                onChange={() => toggleButton(button.id)}
                disabled={disabled}
                className="w-4 h-4 accent-interactive-primary disabled:cursor-not-allowed"
              />
            </label>
          );
        })}
      </div>
      <p className="text-accent text-text-placeholder mt-2">
        The Settings button can&apos;t be hidden. Hidden buttons stay reachable via ⌘K, ⌘T and ⌘E;
        snippets can be managed from the Features tab.
      </p>
    </div>
  );
};
