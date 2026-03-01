export const getDiffDays = (deadline: string): number => {
  const now = new Date();
  const d = new Date(deadline);
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
};

export const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (date < today) return 'Overdue';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface UrgencyCounts {
  red: number;
  yellow: number;
}

export const getUrgencyCounts = (
  todos: { deadline?: string; completed: boolean }[]
): UrgencyCounts => {
  return todos.reduce<UrgencyCounts>(
    (acc, t) => {
      if (!t.deadline || t.completed) return acc;
      const diffDays = getDiffDays(t.deadline);
      if (diffDays < 0) return acc;
      if (diffDays <= 1) acc.red += 1;
      else if (diffDays < 3) acc.yellow += 1;
      return acc;
    },
    { red: 0, yellow: 0 },
  );
};

export const hasUrgentTodos = (
  todos: { deadline?: string; completed: boolean }[]
): boolean => {
  return todos.some((t) => {
    if (!t.deadline || t.completed) return false;
    const diffDays = getDiffDays(t.deadline);
    return diffDays >= 0 && diffDays < 3;
  });
};
