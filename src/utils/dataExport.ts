import type { Slot, Todo, Habit, HomerosExport } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: HomerosExport;
}

export interface ImportSummary {
  slots: number;
  links: number;
  todos: number;
  habits: number;
}

export const createExportData = (
  bookmarks: Slot[],
  todos: Todo[],
  habits: Habit[]
): HomerosExport => {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      bookmarks,
      todos,
      habits,
    },
  };
};

export const downloadExport = (data: HomerosExport): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `homeros-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const validateImport = (fileContent: string): ValidationResult => {
  try {
    const parsed = JSON.parse(fileContent);

    if (parsed.version !== 1) {
      return { valid: false, error: 'Unsupported file version' };
    }

    if (!parsed.data) {
      return { valid: false, error: 'Missing data field' };
    }

    if (!Array.isArray(parsed.data.bookmarks)) {
      return { valid: false, error: 'Invalid bookmarks data' };
    }

    if (!Array.isArray(parsed.data.todos)) {
      return { valid: false, error: 'Invalid todos data' };
    }

    if (!Array.isArray(parsed.data.habits)) {
      return { valid: false, error: 'Invalid habits data' };
    }

    for (const slot of parsed.data.bookmarks) {
      if (!slot.id || !slot.name || !Array.isArray(slot.links)) {
        return { valid: false, error: 'Invalid slot structure' };
      }
      for (const link of slot.links) {
        if (!link.id || !link.title || !link.url) {
          return { valid: false, error: 'Invalid link structure' };
        }
      }
    }

    for (const todo of parsed.data.todos) {
      if (!todo.id || !todo.text || typeof todo.completed !== 'boolean') {
        return { valid: false, error: 'Invalid todo structure' };
      }
    }

    for (const habit of parsed.data.habits) {
      if (!habit.id || !habit.text || !Array.isArray(habit.completedDates)) {
        return { valid: false, error: 'Invalid habit structure' };
      }
    }

    return { valid: true, data: parsed as HomerosExport };
  } catch {
    return { valid: false, error: 'Invalid JSON format' };
  }
};

export const getImportSummary = (data: HomerosExport): ImportSummary => {
  const totalLinks = data.data.bookmarks.reduce(
    (sum, slot) => sum + slot.links.length,
    0
  );

  return {
    slots: data.data.bookmarks.length,
    links: totalLinks,
    todos: data.data.todos.length,
    habits: data.data.habits.length,
  };
};

export const mergeBookmarks = (
  existing: Slot[],
  imported: Slot[]
): Slot[] => {
  const result = [...existing];
  let maxOrder = Math.max(...existing.map((s) => s.order), -1);

  for (const importedSlot of imported) {
    const existingSlot = result.find(
      (s) => s.name.toLowerCase() === importedSlot.name.toLowerCase()
    );

    if (existingSlot) {
      const existingUrls = new Set(
        existingSlot.links.map((l) => l.url.toLowerCase())
      );
      let linkMaxOrder = Math.max(...existingSlot.links.map((l) => l.order), -1);

      for (const link of importedSlot.links) {
        if (!existingUrls.has(link.url.toLowerCase())) {
          linkMaxOrder++;
          existingSlot.links.push({
            ...link,
            id: crypto.randomUUID(),
            order: linkMaxOrder,
          });
        }
      }
    } else {
      maxOrder++;
      const newSlot: Slot = {
        ...importedSlot,
        id: crypto.randomUUID(),
        order: maxOrder,
        links: importedSlot.links.map((link, index) => ({
          ...link,
          id: crypto.randomUUID(),
          order: index,
        })),
      };
      result.push(newSlot);
    }
  }

  return result;
};

export const mergeTodos = (existing: Todo[], imported: Todo[]): Todo[] => {
  const result = [...existing];
  let maxOrder = Math.max(...existing.map((t) => t.order), -1);

  const existingKeys = new Set(
    existing.map((t) => `${t.text.toLowerCase()}|${t.deadline || ''}`)
  );

  for (const todo of imported) {
    const key = `${todo.text.toLowerCase()}|${todo.deadline || ''}`;
    if (!existingKeys.has(key)) {
      maxOrder++;
      result.push({
        ...todo,
        id: crypto.randomUUID(),
        order: maxOrder,
      });
    }
  }

  return result;
};

export const mergeHabits = (existing: Habit[], imported: Habit[]): Habit[] => {
  const result = [...existing];

  for (const importedHabit of imported) {
    const existingHabit = result.find(
      (h) => h.text.toLowerCase() === importedHabit.text.toLowerCase()
    );

    if (existingHabit) {
      const dateSet = new Set([
        ...existingHabit.completedDates,
        ...importedHabit.completedDates,
      ]);
      existingHabit.completedDates = Array.from(dateSet).sort();
    } else {
      result.push({
        ...importedHabit,
        id: crypto.randomUUID(),
      });
    }
  }

  return result;
};

export const regenerateIds = (data: HomerosExport): HomerosExport => {
  return {
    ...data,
    data: {
      bookmarks: data.data.bookmarks.map((slot, slotIndex) => ({
        ...slot,
        id: crypto.randomUUID(),
        order: slotIndex,
        links: slot.links.map((link, linkIndex) => ({
          ...link,
          id: crypto.randomUUID(),
          order: linkIndex,
        })),
      })),
      todos: data.data.todos.map((todo, index) => ({
        ...todo,
        id: crypto.randomUUID(),
        order: index,
      })),
      habits: data.data.habits.map((habit) => ({
        ...habit,
        id: crypto.randomUUID(),
      })),
    },
  };
};
