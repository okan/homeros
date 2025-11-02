export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
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

export interface BookmarkStore {
  slots: Slot[];
  isEditMode: boolean;
  toggleEditMode: () => void;
  addSlot: (name: string, icon: string) => void;
  updateSlot: (id: string, name: string, icon: string) => void;
  deleteSlot: (id: string) => void;
  reorderSlots: (slots: Slot[]) => void;
  addLink: (slotId: string, title: string, url: string, description?: string) => void;
  updateLink: (
    slotId: string,
    linkId: string,
    title: string,
    url: string,
    description?: string,
  ) => void;
  deleteLink: (slotId: string, linkId: string) => void;
  reorderLinks: (slotId: string, links: Link[]) => void;
  loadFromStorage: (data: Slot[]) => void;
}

export interface TodoStore {
  todos: Todo[];
  isTodoPanelOpen: boolean;
  toggleTodoPanel: () => void;
  addTodo: (text: string, deadline?: string) => void;
  updateTodo: (id: string, text: string, deadline?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
  loadTodosFromStorage: (data: Todo[]) => void;
}
