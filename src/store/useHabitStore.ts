import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Habit {
    id: string;
    text: string;
    completedDates: string[]; // ISO date strings (YYYY-MM-DD)
}

interface HabitState {
    habits: Habit[];
    addHabit: (text: string) => void;
    removeHabit: (id: string) => void;
    toggleHabit: (id: string, date: string) => void;
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set) => ({
            habits: [],
            addHabit: (text) =>
                set((state) => ({
                    habits: [
                        ...state.habits,
                        { id: uuidv4(), text, completedDates: [] },
                    ],
                })),
            removeHabit: (id) =>
                set((state) => ({
                    habits: state.habits.filter((h) => h.id !== id),
                })),
            toggleHabit: (id, date) =>
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const isCompleted = h.completedDates.includes(date);
                        return {
                            ...h,
                            completedDates: isCompleted
                                ? h.completedDates.filter((d) => d !== date)
                                : [...h.completedDates, date],
                        };
                    }),
                })),
        }),
        {
            name: 'homeros-habits',
        }
    )
);
