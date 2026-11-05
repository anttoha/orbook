import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toggleCourse } from "../utils/courses";

// ─────────────────────────────────────────────────────────────
// userStore — те, що користувач налаштовує САМ і що живе тільки на пристрої
// (сервер про це не знає): нотатки, вибрані курси, свої кольори, вихідні.
// persist зберігає все в localStorage (ключ "orbook-user"),
// тому після перезавантаження сторінки дані лишаються.
// ─────────────────────────────────────────────────────────────

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ── стан ──
      notes: [], // нотатки: { id, date: "2026-10-07", period: 2 | null, text, updatedAt }
      picked: [], // «Meine Kurse»: номери вибраних курсів за вибором (course.nr). [] — показувати все
      colorOverrides: {}, // свої кольори: { Ma: "kunst" } — Mathe малюється палітрою Kunst
      showWeekend: false, // показувати Sa/So у сітці тижня
      // Чи пройдено екран «Welche Kurse hast du?». Окремий прапорець, бо picked: [] теж законний вибір
      coursesChosen: false,
      // «Darstellung». За замовчуванням — як на макеті 24
      startView: "woche", // що відкривати на «/»: "woche" | "heute"
      dayView: "liste", // вигляд дня: "liste" | "zeitleiste"
      compactWeek: true, // менші клітинки тижня
      fontScale: 2, // шрифт: 1 — A, 2 — A+ (як на макетах), 3 — A++

      // ── нотатки ──

      // Створити або оновити нотатку. period — номер уроку або null (нотатка на день)
      saveNote: ({ id, date, period = null, text }) => {
        // id: у нотатки до уроку він сталий («дата#урок»), у нотатки на день — випадковий
        const noteId = id ?? (period ? `${date}#${period}` : `${date}#${crypto.randomUUID()}`);
        const note = { id: noteId, date, period, text, updatedAt: Date.now() };
        set({ notes: [...get().notes.filter((n) => n.id !== noteId), note] }); // замінюємо стару версію
        return noteId;
      },

      // Видалити нотатку
      deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),

      // ── курси ──

      // «Kurs ausblenden»: прибрати курс із вибраних.
      // Якщо ще нічого не вибрано (видно все) — вибираємо всі курси за вибором, крім цього.
      // allOptional — номери всіх курсів за вибором (з /api/courses)
      hideCourse: (nr, allOptional) => set({ picked: toggleCourse(get().picked, nr, allOptional) }),

      // Повернути попередній вибір (кнопка «Rückgängig» у сповіщенні)
      setPicked: (picked) => set({ picked }),

      // «Weiter» на екрані першого запуску: зберегти вибір і більше не питати
      finishCourseChoice: (picked) => set({ picked, coursesChosen: true }),

      // Показати всі курси знову
      showAllCourses: () => set({ picked: [] }),

      // ── вигляд ──

      // Свій колір предмета. palette = ключ палітри або null (повернути стандартний)
      setFachColor: (code, palette) => {
        const next = { ...get().colorOverrides }; // копія об'єкта
        if (!palette) delete next[code]; // стандартний колір — просто видаляємо запис
        else next[code] = palette;
        set({ colorOverrides: next });
      },

      // Показати / сховати вихідні в сітці тижня
      toggleWeekend: () => set({ showWeekend: !get().showWeekend }),

      // Замінити всі свої кольори разом: «Standard» у Fachfarben і його «Rückgängig»
      setColorOverrides: (colorOverrides) => set({ colorOverrides }),

      setStartView: (startView) => set({ startView }),
      setDayView: (dayView) => set({ dayView }),
      setCompactWeek: (compactWeek) => set({ compactWeek }),

      // Розмір шрифту: атрибут на <html> вмикає масштаб в index.css
      setFontScale: (fontScale) => {
        document.documentElement.dataset.fontScale = fontScale;
        set({ fontScale });
      },
    }),
    {
      name: "orbook-user", // ключ у localStorage
      version: 2, // версія 2: дані з сервера (коди предметів замість «mathe», курси за номером)
      // Старі налаштування (з тестових даних) не підходять — лишаємо тільки нотатки і вихідні
      migrate: (old) => ({ notes: old?.notes ?? [], picked: [], colorOverrides: {}, showWeekend: old?.showWeekend ?? false }),
    },
  ),
);
