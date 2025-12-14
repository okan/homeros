import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="p-fine rounded-control text-text-secondary hover:bg-bg-content hover:text-text-primary transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};
