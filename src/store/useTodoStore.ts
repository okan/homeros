import { create } from 'zustand';
import type { Todo } from '../types';

interface TodoStore {
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

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  isTodoPanelOpen: false,

  toggleTodoPanel: () =>
    set((state) => ({
      isTodoPanelOpen: !state.isTodoPanelOpen,
    })),

  addTodo: (text: string, deadline?: string) =>
    set((state) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        deadline,
        createdAt: new Date().toISOString(),
        order: state.todos.length,
      };
      return { todos: [...state.todos, newTodo] };
    }),

  updateTodo: (id: string, text: string, deadline?: string) =>
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? { ...todo, text, deadline } : todo)),
    })),

  toggleTodo: (id: string) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    })),

  deleteTodo: (id: string) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  reorderTodos: (todos: Todo[]) =>
    set(() => ({
      todos: todos.map((todo, index) => ({ ...todo, order: index })),
    })),

  loadTodosFromStorage: (data: Todo[]) =>
    set(() => ({
      todos: data,
    })),
}));
