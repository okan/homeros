import { useState } from 'react';
import {
  Sparkles,
  FolderOpen,
  Search,
  ListTodo,
  Palette,
  ChevronRight,
  ArrowRight,
  Command,
  Tag,
  Download,
  Scissors,
  ToggleLeft,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface OnboardingCarouselProps {
  onComplete: () => void;
}

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
}

const slides: Slide[] = [
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: 'Welcome to Homeros',
    description: 'Your new tab, beautifully organized. Create a personalized start page that helps you stay focused and productive.',
  },
  {
    icon: <FolderOpen className="w-12 h-12" />,
    title: 'Organize with Slots',
    description: 'Group your bookmarks into customizable slots. Drag and drop to reorder, add icons, and keep everything tidy.',
    features: ['Create unlimited slots', 'Custom icons for each slot', 'Drag & drop reordering'],
  },
  {
    icon: <Search className="w-12 h-12" />,
    title: 'Quick Search',
    description: 'Find any bookmark instantly with the powerful search. Use tags for even faster access.',
    features: ['Press ⌘K to search', 'Search by title or tags', 'Keyboard navigation'],
  },
  {
    icon: <ListTodo className="w-12 h-12" />,
    title: 'Stay on Track',
    description: 'Built-in todo list with deadline tracking and a daily habit tracker. Never miss an important task again.',
    features: ['Open the panel with ⌘T', 'Deadlines with visual warnings', 'Track daily habits & streaks'],
  },
  {
    icon: <Scissors className="w-12 h-12" />,
    title: 'Quick Text Snippets',
    description: 'Store and copy frequently used texts instantly. Perfect for emails, bios, and more.',
    features: ['Enable in Settings → Features', 'Access from top-right icon', 'Search & copy with ⌘K'],
  },
  {
    icon: <Palette className="w-12 h-12" />,
    title: 'Make it Yours',
    description: 'Customize every aspect. Pick a theme, tailor the toolbar, and back up your data anytime.',
    features: ['7 preset color themes', 'Customizable toolbar', 'Export & import data'],
  },
];

const FeatureIcon = ({ feature }: { feature: string }) => {
  if (feature.includes('⌘')) return <Command className="w-4 h-4 shrink-0" />;
  if (feature.includes('tag')) return <Tag className="w-4 h-4 shrink-0" />;
  if (feature.includes('theme')) return <Palette className="w-4 h-4 shrink-0" />;
  if (feature.includes('toolbar')) return <SlidersHorizontal className="w-4 h-4 shrink-0" />;
  if (feature.includes('habit')) return <Flame className="w-4 h-4 shrink-0" />;
  if (feature.includes('Export')) return <Download className="w-4 h-4 shrink-0" />;
  if (feature.includes('Settings')) return <ToggleLeft className="w-4 h-4 shrink-0" />;
  if (feature.includes('icon') || feature.includes('Manage')) return <Scissors className="w-4 h-4 shrink-0" />;
  return <ArrowRight className="w-4 h-4 shrink-0" />;
};

export const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  const isLastSlide = currentSlide === slides.length - 1;

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setDirection(index > currentSlide ? 'right' : 'left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 150);
  };

  const nextSlide = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      goToSlide(currentSlide + 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        <div className="overflow-hidden rounded-2xl bg-bg-content border border-border-element shadow-2xl">
          <div className="flex justify-end pt-4 px-4">
            <button
              onClick={onComplete}
              className="text-text-placeholder hover:text-text-primary text-sm font-medium transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="p-8 pt-2 pb-6">
            <div
              className={`transition-all duration-300 ${isAnimating
                  ? direction === 'right'
                    ? 'opacity-0 -translate-x-8'
                    : 'opacity-0 translate-x-8'
                  : 'opacity-100 translate-x-0'
                }`}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-interactive-primary/10 text-interactive-primary animate-float">
                  {slide.icon}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-text-primary text-center mb-3">
                {slide.title}
              </h2>

              <p className="text-text-secondary text-center leading-relaxed mb-6">
                {slide.description}
              </p>

              {slide.features && (
                <div className="space-y-2">
                  {slide.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border-element text-text-secondary"
                    >
                      <FeatureIcon feature={feature} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentSlide
                      ? 'w-8 h-2 bg-interactive-primary'
                      : 'w-2 h-2 bg-interactive-primary/30 hover:bg-interactive-primary/50'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-interactive-primary hover:bg-interactive-primary-hover text-white font-medium transition-all"
            >
              {isLastSlide ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
