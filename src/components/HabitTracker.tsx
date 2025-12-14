import { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { Plus, X, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

export const HabitTracker = () => {
    const { habits, addHabit, removeHabit, toggleHabit } = useHabitStore();
    const [newHabit, setNewHabit] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');

    const handleToggle = (id: string, isCompleted: boolean) => {
        toggleHabit(id, today);
        if (!isCompleted) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
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
                    <Flame className="w-5 h-5 text-orange-500" />
                    Daily Habits
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded hover:bg-bg-wash text-text-secondary transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        placeholder="New habit..."
                        className="flex-1 px-3 py-2 bg-bg-wash rounded-control text-value border border-transparent focus:border-interactive-primary focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="p-2 text-interactive-primary hover:bg-interactive-selected rounded-control transition-colors"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </form>
            )}

            <div className="space-y-2">
                {habits.map((habit) => {
                    const isCompleted = habit.completedDates.includes(today);
                    return (
                        <div
                            key={habit.id}
                            className="group flex items-center gap-3 p-2 rounded-control hover:bg-bg-wash transition-colors"
                        >
                            <button
                                onClick={() => handleToggle(habit.id, isCompleted)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-text-placeholder hover:border-interactive-primary'
                                    }`}
                            >
                                {isCompleted && <Check className="w-4 h-4" />}
                            </button>

                            <span
                                className={`flex-1 text-value transition-all ${isCompleted ? 'text-text-placeholder line-through' : 'text-text-primary'
                                    }`}
                            >
                                {habit.text}
                            </span>

                            <button
                                onClick={() => removeHabit(habit.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-text-placeholder hover:text-red-500 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {habits.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-text-placeholder text-sm">
                        No habits yet. Start small!
                    </div>
                )}
            </div>
        </div>
    );
};
