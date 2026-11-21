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

      // Lernplan (часть 41): задачи плана — свои задачи с полем plan. Сохранить = старые в «надгробки», новые добавить
      savePlan: (examId, planTasks) => {
        const id = String(examId);
        const cleared = get().tasks.map((t) => (!t.deleted && t.plan?.exam === id ? removeTask(t) : t));
        set({ tasks: [...cleared, ...planTasks] });
      },
      deletePlan: (examId) => set({ tasks: get().tasks.map((t) => (!t.deleted && t.plan?.exam === String(examId) ? removeTask(t) : t)) }),
      // Тест удалили, а план оставили: больше не спрашиваем
      keepPlan: (examId) => set({ tasks: get().tasks.map((t) => (!t.deleted && t.plan?.exam === String(examId) ? editTask(t, { plan: { ...t.plan, kept: true } }) : t)) }),
      // Тест перенесли: готовые задачи с новыми датами (lernplan.shiftPlan)
      replaceTasks: (changed) => {
        const byId = new Map(changed.map((t) => [t.id, t]));
        set({ tasks: get().tasks.map((t) => byId.get(t.id) ?? t) });
      },

      // Галочка у домашки класса (видишь только ты)
      markHomework: (id, done) => set({ marks: setMark(get().marks, id, done) }),

      // Результат синхронизации: слитые списки
      setSynced: ({ tasks, marks }) => set({ tasks, marks }),
    }),
    { name: "orbook-tasks" },
  ),
);
