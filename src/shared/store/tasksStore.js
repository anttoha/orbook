import { create } from "zustand";
import { persist } from "zustand/middleware";
import { editTask, newTask, removeTask, setMark } from "../utils/tasks";

// ─────────────────────────────────────────────────────────────
// tasksStore — «Aufgaben» (часть 25): свои задачи и галочки у домашек класса.
// Только на устройстве (localStorage «orbook-tasks»); с Sync-Code — ещё в зашифрованном блоке.
// ─────────────────────────────────────────────────────────────
export const useTasksStore = create(
  persist(
    (set, get) => ({
      tasks: [], // свои задачи (shared/utils/tasks.js), удалённые — «надгробки»
      marks: [], // галочки домашек: { id, done, updatedAt }

      addTask: (fields) => set({ tasks: [...get().tasks, newTask(fields)] }),
      updateTask: (id, patch) => set({ tasks: get().tasks.map((t) => (t.id === id ? editTask(t, patch) : t)) }),
      toggleTask: (id) => set({ tasks: get().tasks.map((t) => (t.id === id ? editTask(t, { done: !t.done }) : t)) }),

      // Удалить: возвращаем старую версию — для «Rückgängig»
      deleteTask: (id) => {
        const old = get().tasks.find((t) => t.id === id);
        set({ tasks: get().tasks.map((t) => (t.id === id ? removeTask(t) : t)) });
        return old;
      },
      restoreTask: (task) => set({ tasks: [...get().tasks.filter((t) => t.id !== task.id), editTask(task, {})] }),

      // Галочка у домашки класса (видишь только ты)
      markHomework: (id, done) => set({ marks: setMark(get().marks, id, done) }),

      // Результат синхронизации: слитые списки
      setSynced: ({ tasks, marks }) => set({ tasks, marks }),
    }),
    { name: "orbook-tasks" },
  ),
);
