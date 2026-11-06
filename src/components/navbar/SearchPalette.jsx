import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Moon, NotebookPen, Plus, Search, Settings, Sun } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useWeek } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { isDarkTheme, useTheme } from "../../shared/hooks/useTheme";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { settingsSections } from "../../shared/constants/constants";
import { cn } from "../../shared/utils/cn";
import { addExamTarget, canCreateExam, isTeacher } from "../../shared/utils/examRules";
import { currentMonday } from "../../shared/utils/lessons";
import { searchActions, searchGroups } from "../../shared/utils/search";
import Kbd from "../ui/Kbd";
import SubjectBadge from "../ui/SubjectBadge";

// Іконки рядків без предмета (ключ icon з shared/utils/search.js)
const ICONS = { note: NotebookPen, settings: Settings, plus: Plus, calendar: CalendarDays, sun: Sun, moon: Moon };

// Рядок результату: кружечок предмета або іконка, два рядки тексту, праворуч клавіша (↵ на вибраному)
const ResultRow = ({ item, active, onHover, onChoose }) => {
  const Icon = ICONS[item.icon];
  return (
    <li role="option" aria-selected={active}>
      <button type="button" onMouseMove={onHover} onClick={onChoose} className={cn("flex w-full items-center gap-3.5 rounded-field px-3 py-2 text-left", active && "bg-tint")}>
        {Icon ? (
          <span className="grid size-7.5 shrink-0 place-items-center text-muted">
            <Icon className="size-4.5" />
          </span>
        ) : (
          <SubjectBadge subject={item.subject} className="size-7.5" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-row font-semibold text-ink">{item.title}</span>
          <span className="block truncate text-hint text-muted">{item.subtitle}</span>
        </span>
        {active ? <Kbd>↵</Kbd> : item.kbd && <Kbd>{item.kbd}</Kbd>}
      </button>
    </li>
  );
};

// ─────────────────────────────────────────────────────────────
// Вікно пошуку ⌘K посередині (ПК, макет 51). Шукає в уроках поточного тижня, Klausuren, нотатках
// і розділах Einstellungen; «Aktionen» завжди внизу. ↑ ↓ — вибір, Enter — відкрити, Esc — закрити.
// open / onOpenChange — ззовні (поле в сайдбарі і ⌘K)
// ─────────────────────────────────────────────────────────────
const SearchPalette = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0); // номер вибраного рядка в загальному списку
  const { today } = useNow();
  const week = useWeek(currentMonday(today));
  const exams = usePlanStore((s) => s.exams);
  const me = usePlanStore((s) => s.me);
  const notes = useUserStore((s) => s.notes);
  const { theme, setTheme } = useTheme();
  const { openSheet } = useSheet();
  const navigate = useNavigate();
  const dark = isDarkTheme(theme);

  const groups = [
    ...searchGroups(query, { days: week.data?.days ?? [], exams, notes, sections: settingsSections.filter((section) => !(section.classOnly && isTeacher(me))) }),
    searchActions({ canCreate: canCreateExam(me), today, dark }),
  ];
  const flat = groups.flatMap((group) => group.items); // для стрілок ↑ ↓

  // Закрити й почати наступного разу з порожнього поля
  const close = () => {
    onOpenChange(false);
    setQuery("");
    setActive(0);
  };

  // Виконати вибране: шторка, сторінка або дія
  const choose = (item) => {
    close();
    const { target } = item;
    if (target.sheet) openSheet(target.sheet, target.params);
    else if (target.path) navigate(target.path);
    else if (target.action === "exam") navigate(addExamTarget(me) ?? "/testen");
    else if (target.action === "theme") setTheme(dark ? "light" : "dark");
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + flat.length) % flat.length); // по колу
    } else if (event.key === "Enter" && flat[active]) {
      event.preventDefault();
      choose(flat[active]);
    }
  };

  let index = -1; // наскрізний номер рядка через усі групи
  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-27.5 left-1/2 z-50 flex max-h-[calc(100dvh-8rem)] w-palette max-w-[calc(100%-2rem)] -translate-x-1/2 flex-col overflow-hidden rounded-panel bg-card shadow-sheet outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          <Dialog.Title className="sr-only">Suchen</Dialog.Title>
          <div className="flex h-17 shrink-0 items-center gap-3 border-b border-hair px-5">
            <Search className="size-5 shrink-0 text-faint" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0); // новий запит — вибір на першому
              }}
              onKeyDown={handleKeyDown}
              placeholder="Stunde, Klausur, Notiz suchen"
              aria-label="Suchen"
              className="min-w-0 flex-1 bg-transparent text-cell-sm font-normal text-ink outline-none placeholder:text-faint2"
            />
            <Kbd>Esc</Kbd>
          </div>

          <div role="listbox" aria-label="Ergebnisse" className="min-h-0 flex-1 overflow-y-auto px-2.5 pt-3 pb-2">
            {query.trim() && groups.length === 1 && <p className="px-3 pb-3 text-body-sm font-bold text-faint">Nichts gefunden</p>}
            {groups.map((group) => (
              <section key={group.title} className="mb-2">
                <h3 className="px-3 pb-1.5 text-hint font-extrabold text-faint">{group.title}</h3>
                <ul>
                  {group.items.map((item) => {
                    index += 1;
                    const i = index;
                    return <ResultRow key={item.id} item={item} active={i === active} onHover={() => setActive(i)} onChoose={() => choose(item)} />;
                  })}
                </ul>
              </section>
            ))}
          </div>

          <footer className="flex h-11 shrink-0 items-center gap-2 border-t border-hair bg-paper px-5 text-caption text-faint">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>wählen</span>
            <Kbd className="ml-2">↵</Kbd>
            <span>öffnen</span>
            <span className="ml-auto truncate">Stunden, Klausuren, Notizen, Einstellungen</span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SearchPalette;
