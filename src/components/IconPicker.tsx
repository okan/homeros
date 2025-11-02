import { useState } from 'react';
import {
  Home,
  Star,
  Heart,
  Bookmark,
  Folder,
  Code,
  Terminal,
  GitBranch,
  Database,
  Server,
  Cloud,
  Package,
  Cpu,
  HardDrive,
  Zap,
  Bug,
  FileCode,
  Braces,
  type LucideIcon,
} from 'lucide-react';

const ICONS: { name: string; Icon: LucideIcon; category: 'basic' | 'dev' }[] = [
  { name: 'Home', Icon: Home, category: 'basic' },
  { name: 'Star', Icon: Star, category: 'basic' },
  { name: 'Heart', Icon: Heart, category: 'basic' },
  { name: 'Bookmark', Icon: Bookmark, category: 'basic' },
  { name: 'Folder', Icon: Folder, category: 'basic' },
  { name: 'Code', Icon: Code, category: 'dev' },
  { name: 'Terminal', Icon: Terminal, category: 'dev' },
  { name: 'GitBranch', Icon: GitBranch, category: 'dev' },
  { name: 'Database', Icon: Database, category: 'dev' },
  { name: 'Server', Icon: Server, category: 'dev' },
  { name: 'Cloud', Icon: Cloud, category: 'dev' },
  { name: 'Package', Icon: Package, category: 'dev' },
  { name: 'Cpu', Icon: Cpu, category: 'dev' },
  { name: 'HardDrive', Icon: HardDrive, category: 'dev' },
  { name: 'Zap', Icon: Zap, category: 'dev' },
  { name: 'Bug', Icon: Bug, category: 'dev' },
  { name: 'FileCode', Icon: FileCode, category: 'dev' },
  { name: 'Braces', Icon: Braces, category: 'dev' },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export const IconPicker = ({ selectedIcon, onSelect }: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const SelectedIconComponent = ICONS.find((i) => i.name === selectedIcon)?.Icon || Folder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-fine rounded-control hover:bg-bg-wash transition-colors"
      >
        <SelectedIconComponent className="w-5 h-5 text-icon-default" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-fine z-20 bg-bg-content rounded-container shadow-card-lg p-fine w-64">
            <div className="grid grid-cols-6 gap-fine">
              {ICONS.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect(name);
                    setIsOpen(false);
                  }}
                  className={`p-fine rounded-control transition-colors ${
                    selectedIcon === name
                      ? 'bg-interactive-selected text-interactive-primary'
                      : 'hover:bg-bg-wash text-icon-default'
                  }`}
                  title={name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return ICONS.find((i) => i.name === iconName)?.Icon || Folder;
};
