import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteNote, editNote, findNote, newNote, upgradeNote } from "../utils/notes";

// ─────────────────────────────────────────────────────────────
// userStore — те, що користувач налаштовує САМ і що живе тільки на пристрої
// (сервер про це не знає): нотатки, вибрані курси, свої кольори, вихідні.
// persist зберігає все в localStorage (ключ "orbook-user"),
// тому після перезавантаження сторінки дані лишаються.
// ─────────────────────────────────────────────────────────────

// Перехід зі старої версії сховища. Налаштування з тестових даних (до версії 2) не підходять —
// лишаємо тільки нотатки і вихідні. Нотатки старших версій отримують предмет і час ISO
export function migrateUser(old, from) {
  const notes = (old?.notes ?? []).map(upgradeNote);
  if (from < 2) return { notes, picked: [], hiddenRequired: [], colorOverrides: {}, showWeekend: old?.showWeekend ?? false };
  return { ...old, notes };
}

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ── стан ──
      notes: [], // нотатки (shared/utils/notes.js): { id, text, date, subject, period, updatedAt, deleted? }
      picked: [], // «Meine Kurse»: номери вибраних курсів за вибором (course.nr). [] — показувати все
      hiddenRequired: [], // номери прихованих обов'язкових курсів: учень сам вирішує, що бачити
      colorOverrides: {}, // свої кольори: { Ma: "kunst" } — Mathe малюється палітрою Kunst
      showWeekend: false, // показувати Sa/So у сітці тижня
      // Чи пройдено екран «Welche Kurse hast du?». Окремий прапорець, бо picked: [] теж законний вибір
      coursesChosen: false,
      // «Darstellung». За замовчуванням — як на макеті 24
      startView: "woche", // що відкривати на «/»: "woche" | "heute"
      dayView: "liste", // вигляд дня: "liste" | "zeitleiste"
      compactWeek: true, // менші клітинки тижня
      fontScale: 2, // шрифт: 1 — A, 2 — A+ (як на макетах), 3 — A++
      changedFormat: "weekday", // підпис зміни під днем: "weekday" «Mi 15:15» | "date" «15.09.» | "datetime" «15.09. 15:15»
      allCourses: false, // режим «Alle Kurse»: видно й чужі курси (пунктиром)
      checkedPlan: [], // «So lassen» у «Einträge prüfen» (частина 19): ключі з shared/utils/muster.js checkKey

      // ── нотатки ──

      // Створити або оновити нотатку. id — є у нотатки, яку змінюємо; period — номер уроку або null
      saveNote: ({ id, date, period = null, subject = null, text }) => {
        const old = get().notes.find((n) => n.id === (id ?? (period ? `${date}#${period}` : null)));
        const note = old ? editNote(old, { date, subject, text, deleted: undefined }) : newNote(text, { date, subject, period });
        set({ notes: [...get().notes.filter((n) => n.id !== note.id), note] }); // замінюємо стару версію
        return note.id;
      },

      // «In die 6. Stunde» (частина 19): нотатка до уроку переїжджає на інший урок того ж дня.
      // id нотатки до уроку — «дата#урок», тому це нова нотатка + надгробок старої. Якщо там уже є текст — дописуємо
      moveNote: (id, period) => {
        const old = findNote(get().notes, id);
        if (!old) return;
        const there = findNote(get().notes, `${old.date}#${period}`);
        const text = there ? `${there.text}\n${old.text}` : old.text;
        get().saveNote({ date: old.date, period, subject: old.subject, text });
        get().deleteNote(id);
      },

      // «So lassen»: більше не питати про цей запис (останні 200 ключів)
      dismissCheck: (key) => set({ checkedPlan: [...get().checkedPlan.filter((k) => k !== key), key].slice(-200) }),

      // Видалити: лишається «надгробок», щоб видалення дійшло до інших пристроїв
      deleteNote: (id) => set({ notes: get().notes.map((n) => (n.id === id ? deleteNote(n) : n)) }),

      // «Rückgängig»: повернути стару версію (з новим часом — щоб вона перемогла надгробок)
      restoreNote: (note) => set({ notes: [...get().notes.filter((n) => n.id !== note.id), editNote(note, {})] }),

      // Результат синхронізації: злитий список
      setNotes: (notes) => set({ notes }),

      // ── курси ──

      // Сховані обов'язкові курси (Meine Kurse, «Kurs ausblenden»; номери рахує shared/utils/courses.js)
      setHiddenRequired: (hiddenRequired) => set({ hiddenRequired }),

      // Повернути попередній вибір (кнопка «Rückgängig» у сповіщенні)
      setPicked: (picked) => set({ picked }),

      // «Weiter» на екрані першого запуску: зберегти вибір і більше не питати
      finishCourseChoice: (picked, hiddenRequired = []) => set({ picked, hiddenRequired, coursesChosen: true }),

      // «Alle Kurse» (частина 22): лише показати весь план класу. Вибір «Meine Kurse» НЕ змінюється
      // (раніше кнопки «показати все» стирали picked — це й був баг 20a)
      setAllCourses: (allCourses) => set({ allCourses }),

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
      setChangedFormat: (changedFormat) => set({ changedFormat }),

      // Розмір шрифту: атрибут на <html> вмикає масштаб в index.css
      setFontScale: (fontScale) => {
        document.documentElement.dataset.fontScale = fontScale;
        set({ fontScale });
      },
    }),
    {
      name: "orbook-user", // ключ у localStorage
      version: 3, // 2: дані з сервера замість тестових; 3: нотатки з предметом і часом ISO (синхронізація)
      migrate: migrateUser,
    },
  ),
);
