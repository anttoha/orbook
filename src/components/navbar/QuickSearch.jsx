import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, Flag, NotebookPen, Search } from "lucide-react";
import { useHotkeys } from "../../shared/hooks/useHotkeys";
import { useNow } from "../../shared/hooks/useNow";
import { useWeek } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { longDate, subjectName, weekdayLong, weekdayShort } from "../../shared/utils/format";
import { currentMonday } from "../../shared/utils/lessons";
import Kbd from "../ui/Kbd";

// Скільки результатів показувати максимум
const MAX_RESULTS = 8;

// ─────────────────────────────────────────────────────────────
// Збираємо все, за чим можна шукати: уроки поточного тижня, Klausuren, нотатки.
// Кожен елемент: { id, icon, title, subtitle, haystack (текст для пошуку), action }
// ─────────────────────────────────────────────────────────────
const buildIndex = (days, exams, notes, { openSheet, navigate }) => {
  const items = [];

  // Уроки Mo–Fr поточного тижня (з уже завантаженого тижня)
  days.forEach((day) => {
    day.lessons.forEach((lesson) => {
      const name = subjectName(lesson.subject);
      items.push({
        id: `l-${day.date}-${lesson.period}-${lesson.subject.code}-${lesson.course?.nr ?? ""}`,
        icon: CalendarDays,
        title: `${name} · ${day.weekday} ${lesson.period}. Std`,
        subtitle: [lesson.teacher, lesson.room && `Raum ${lesson.room}`, lesson.course?.label].filter(Boolean).join(" · "),
        haystack: [name, lesson.subject.code, lesson.teacher, lesson.room, lesson.course?.label, weekdayLong(day.date)].join(" "),
        action: () => openSheet("stunde", { datum: day.date, stunde: lesson.period, fach: lesson.subject.code }), // відкрити урок
      });
    });
  });

  // Найближчі Klausuren (GET /api/exams)
  exams.forEach((exam) => {
    const name = subjectName(exam.subject);
    items.push({
      id: `e-${exam.id}`,
      icon: Flag,
      title: `${exam.type} · ${name}`,
      subtitle: `${weekdayShort(exam.date)}, ${longDate(exam.date)}${exam.lesson ? ` · ${exam.lesson}. Std` : ""}${exam.topic ? ` · ${exam.topic}` : ""}`,
      haystack: [exam.type, name, exam.topic, "Klausur Test"].join(" "),
      action: () => navigate(`/tag/${exam.date}`), // сторінка дня
    });
  });

  // Свої нотатки
  notes.forEach((note) => {
    items.push({
      id: `n-${note.id}`,
      icon: NotebookPen,
      title: note.text.split("\n")[0], // перший рядок нотатки
      subtitle: `Notiz · ${weekdayShort(note.date)}, ${longDate(note.date)}`,
      haystack: `${note.text} Notiz`,
      action: () => openSheet("notiz", note.period ? { datum: note.date, stunde: note.period } : { datum: note.date, id: note.id }),
    });
  });

  return items;
};

// ─────────────────────────────────────────────────────────────
// Швидкий пошук у сайдбарі. ⌘K / Ctrl+K — курсор у поле.
// Стрілки ↑↓ — вибір, Enter — відкрити, Esc — закрити.
// collapsed — сайдбар згорнутий (тоді клік по полю його розгортає)
// ─────────────────────────────────────────────────────────────
const QuickSearch = ({ collapsed, onExpand }) => {
  const inputRef = useRef(null); // поле вводу (для ⌘K)
  const [query, setQuery] = useState(""); // що ввели
  const [active, setActive] = useState(0); // який результат підсвічений
  const { today } = useNow(); // сьогодні
  const week = useWeek(currentMonday(today)); // поточний тиждень
  const exams = usePlanStore((s) => s.exams); // Klausuren
  const notes = useUserStore((s) => s.notes); // нотатки
  const { openSheet } = useSheet(); // відкрити шторку
  const navigate = useNavigate(); // перехід на сторінку

  // ⌘K / Ctrl+K — фокус у пошук (і розгорнути сайдбар)
  useHotkeys({
    "mod+k": () => {
      onExpand();
      inputRef.current?.focus();
    },
  });

  // Шукаємо: кожне слово запиту має бути в тексті елемента
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length
    ? buildIndex(week.data?.days ?? [], exams, notes, { openSheet, navigate })
        .filter((item) => words.every((w) => item.haystack.toLowerCase().includes(w)))
        .slice(0, MAX_RESULTS)
    : [];

  // Вибрати результат: виконати дію і очистити пошук
  const choose = (item) => {
    item.action();
    setQuery("");
    inputRef.current?.blur();
  };

  // Клавіші всередині поля
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1)); // вниз
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0)); // вгору
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]); // відкрити вибране
    } else if (event.key === "Escape") {
      setQuery(""); // очистити
      inputRef.current?.blur();
    }
  };

  return (
    <Popover.Root open={words.length > 0}>
      {/* Anchor — до чого «прикріплений» список результатів */}
      <Popover.Anchor asChild>
        <div className="relative h-10 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-[13.5px] size-4 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0); // новий запит — підсвічування на першому
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => collapsed && onExpand()} // згорнутий — розгорнути
            placeholder="Suchen"
            aria-label="Suchen"
            role="combobox"
            aria-expanded={words.length > 0}
            className={cn(
              "h-full w-full min-w-0 rounded-full bg-paper pl-10 text-body text-ink outline-none focus:ring-2 focus:ring-accent/30",
              "transition-[color,padding] duration-300 ease-out placeholder:transition-colors",
              collapsed ? "pr-0 placeholder:text-transparent" : "pr-12 placeholder:text-faint placeholder:delay-150",
            )}
          />
          {/* підказка ⌘K праворуч у полі */}
          {!collapsed && <Kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">⌘K</Kbd>}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()} // фокус лишається в полі вводу
          onInteractOutside={() => setQuery("")} // клік повз — закрити
          className="z-50 w-[340px] rounded-2xl border border-hair bg-card p-1.5 shadow-xl shadow-ink/10 data-[state=open]:animate-pop-in"
        >
          {results.length === 0 && <p className="px-3 py-2.5 text-body-sm font-bold text-faint">Nichts gefunden</p>}
          <ul role="listbox">
            {results.map((item, i) => (
              <li key={item.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)} // наведення мишкою теж підсвічує
                  onClick={() => choose(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left",
                    i === active && "bg-sand",
                  )}
                >
                  <item.icon className="size-4.5 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-bold text-ink">{item.title}</span>
                    <span className="block truncate text-caption font-semibold text-faint">{item.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default QuickSearch;
