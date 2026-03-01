import { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { Plus, X, Check, Flame, TrendingUp } from 'lucide-react';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = [...completedDates].sort().reverse();
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
        return 0;
    }
    
    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = parseISO(sortedDates[i]);
        const next = parseISO(sortedDates[i + 1]);
        const diff = differenceInDays(current, next);
        
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
};

const getLast7Days = (completedDates: string[]): boolean[] => {
    const result: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        result.push(completedDates.includes(date));
    }
    return result;
};

export const HabitTracker = () => {
    const { habits, addHabit, removeHabit, toggleHabit } = useHabitStore();
    const [newHabit, setNewHabit] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');

    const handleToggle = async (id: string, isCompleted: boolean) => {
        toggleHabit(id, today);
        if (!isCompleted) {
            const { default: confetti } = await import('canvas-confetti');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#818cf8', '#a5b4fc', '#34d399', '#fbbf24', '#f87171'],
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabit.trim()) {
            addHabit(newHabit.trim());
            setNewHabit('');
            setIsAdding(false);
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-header3 font-semibold text-text-primary flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent-warm" />
                    Daily Habits
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded hover:bg-bg-wash text-text-secondary transition-colors btn-press"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-4 flex gap-2 animate-fade-in-up">
                    <input
                        type="text"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        placeholder="New habit..."
                        className="flex-1 px-3 py-2 bg-bg-wash rounded-control text-value border border-transparent focus:border-interactive-primary focus:outline-none transition-colors"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="p-2 text-interactive-primary hover:bg-interactive-selected rounded-control transition-colors btn-press"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {habits.map((habit) => {
                    const isCompleted = habit.completedDates.includes(today);
                    const streak = calculateStreak(habit.completedDates);
                    const last7Days = getLast7Days(habit.completedDates);
                    
                    return (
                        <div
                            key={habit.id}
                            className="group p-3 rounded-container hover:bg-bg-wash transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(habit.id, isCompleted)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 btn-press ${isCompleted
                                            ? 'bg-accent-success border-accent-success text-white shadow-sm'
                                            : 'border-text-placeholder hover:border-interactive-primary hover:scale-110'
                                        }`}
                                >
                                    {isCompleted && <Check className="w-4 h-4 animate-check" />}
                                </button>

                                <span
                                    className={`flex-1 text-value transition-all ${isCompleted ? 'text-text-placeholder line-through' : 'text-text-primary'
                                        }`}
                                >
                                    {habit.text}
                                </span>

                                {streak > 0 && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-warm/10 text-accent-warm">
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="text-accent font-semibold">{streak}</span>
                                    </div>
                                )}

                            <button
                                onClick={() => removeHabit(habit.id)}
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-text-placeholder hover:text-accent-danger transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-danger rounded-control"
                                aria-label={`Remove "${habit.text}" habit`}
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                            </div>

                            <div className="flex items-center gap-1 mt-2 ml-9">
                                {last7Days.map((completed, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            completed 
                                                ? 'bg-accent-success' 
                                                : 'bg-border-element'
                                        }`}
                                        title={format(subDays(new Date(), 6 - index), 'MMM d')}
                                    />
                                ))}
                                <span className="text-accent text-text-placeholder ml-1">7d</span>
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && !isAdding && (
                    <div className="text-center py-6 text-text-placeholder">
                        <Flame className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-value">No habits yet</p>
                        <p className="text-accent">Start small, stay consistent!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
