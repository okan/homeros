export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  order: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  deadline?: string;
  createdAt: string;
  order: number;
}

export interface Slot {
  id: string;
  name: string;
  icon: string;
  links: Link[];
  order: number;
}

export interface Habit {
  id: string;
  text: string;
  completedDates: string[];
}

export interface Snippet {
  id: string;
  key: string;
  value: string;
  createdAt: string;
}

export interface SnippetSettings {
  enabled: boolean;
}

export interface HomerosExport {
  version: 1;
  exportedAt: string;
  data: {
    bookmarks: Slot[];
    todos: Todo[];
    habits: Habit[];
    snippets?: Snippet[];
  };
}
