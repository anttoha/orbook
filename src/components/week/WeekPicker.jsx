import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../shared/api/api";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { addDays, dayNumber, isoWeek, isWeekend, longDate, mondayOf, monthLong, weekdayLong } from "../../shared/utils/format";
import Button from "../ui/Button";

// Заголовки колонок
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Помічники для місяців. Місяць — рядок першого числа: "2026-10-01"
const firstOfMonth = (iso) => `${iso.slice(0, 7)}-01`;
const shiftMonth = (first, n) => {
  const d = new Date(`${first}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n); // JS сам переносить рік
  return d.toISOString().slice(0, 10);
};
const lastOfMonth = (first) => addDays(shiftMonth(first, 1), -1);

// ─────────────────────────────────────────────────────────────
// Місячний календар «Woche wählen» (у шторці на телефоні і у випадаючому вікні на ПК).
// Клік по дню вибирає весь його тиждень.
//   сірі дні    — вихідні та meta.holidays (назв свят у даних немає — пишемо «frei»)
//   крапки      — Klausuren місяця (GET /api/exams?from=…&to=…)
// onOpenWeek(понеділок) — натиснули «KW xx öffnen»
// ─────────────────────────────────────────────────────────────
const WeekPicker = ({ initialWeek, onOpenWeek }) => {
  const { today } = useNow(); // сьогодні
  const holidays = usePlanStore((s) => s.meta?.holidays); // вільні дні навчального року
  const [selected, setSelected] = useState(() => mondayOf(initialWeek ?? today)); // вибраний тиждень (понеділок)
  const [month, setMonth] = useState(() => firstOfMonth(initialWeek ?? today)); // показаний місяць
  const [examDays, setExamDays] = useState({}); // { "2026-10": Set дат із Klausuren }

  const free = new Set(holidays ?? []); // для швидкої перевірки
  const last = lastOfMonth(month); // останній день місяця

  // Klausuren показаного місяця — окремим запитом (тільки один раз на місяць)
  useEffect(() => {
    const key = month.slice(0, 7);
    let cancelled = false; // місяць змінили, поки чекали — відповідь не потрібна
    api(`/exams?from=${month}&to=${lastOfMonth(month)}`)
      .then((data) => !cancelled && setExamDays((prev) => ({ ...prev, [key]: new Set(data.exams.map((e) => e.date)) })))
      .catch(() => {}); // без мережі просто без крапок
    return () => {
      cancelled = true;
    };
  }, [month]);
  const exams = examDays[month.slice(0, 7)] ?? new Set();

  // Тижні місяця: від понеділка тижня з 1-м числом до тижня з останнім
  const weeks = [];
  for (let monday = mondayOf(month); monday <= last; monday = addDays(monday, 7)) weeks.push(monday);

  // Сервер не віддає дати далі ніж 800 днів — далі не гортаємо
  const canGoNext = shiftMonth(month, 1) <= addDays(today, 790);

  return (
    <>
      {/* ── місяць і стрілки ── */}
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Vorheriger Monat" onClick={() => setMonth((m) => shiftMonth(m, -1))} className="grid size-9 place-items-center rounded-full bg-card text-muted">
          <ChevronLeft className="size-4.5" />
        </button>
        <p className="text-subhead text-ink">
          {monthLong(month)} {month.slice(0, 4)}
        </p>
        <button
          type="button"
          aria-label="Nächster Monat"
          disabled={!canGoNext}
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          className="grid size-9 place-items-center rounded-full bg-card text-muted disabled:opacity-40"
        >
          <ChevronRight className="size-4.5" />
        </button>
      </div>

      {/* ── календар: колонка KW + 7 днів ── */}
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-8 text-center text-small font-extrabold text-faint">
          <span>KW</span>
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {weeks.map((monday) => (
          <div key={monday} className={cn("grid grid-cols-8 items-center rounded-full", monday === selected && "bg-tint")}>
            {/* номер тижня */}
            <span className="text-center text-small font-extrabold text-faint">{isoWeek(monday)}</span>

            {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((day) => {
              const inMonth = day.slice(0, 7) === month.slice(0, 7); // день цього місяця?
              const isFree = free.has(day); // канікули / свято
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelected(mondayOf(day))} // вибрати тиждень цього дня
                  aria-label={`${weekdayLong(day)}, ${longDate(day)}${isFree ? " · frei" : ""}`}
                  className="relative mx-auto grid size-9 place-items-center"
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full text-body-sm font-extrabold",
                      day === today && "bg-accent text-on-accent", // сьогодні — фіолетовий кружечок
                      day !== today && (!inMonth ? "text-faint2" : isWeekend(day) || isFree ? "text-faint" : "text-ink"),
                    )}
                  >
                    {dayNumber(day)}
                  </span>
                  {/* крапка під числом: Klausur — фіолетова, вільний день — сіра */}
                  {(exams.has(day) || isFree) && (
                    <span className={cn("absolute bottom-0 size-1 rounded-full", exams.has(day) ? "bg-accent" : "bg-faint2")} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── легенда ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-accent" /> Klausur
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-faint2" /> frei
        </span>
      </div>

      {/* ── кнопки ── */}
      <div className="flex gap-2.5">
        <Button
          onClick={() => {
            setSelected(mondayOf(today)); // поточний тиждень
            setMonth(firstOfMonth(today)); // і його місяць
          }}
        >
          Heute
        </Button>
        <Button variant="primary" onClick={() => onOpenWeek(selected)}>
          KW {isoWeek(selected)} öffnen
        </Button>
      </div>
    </>
  );
};

export default WeekPicker;
