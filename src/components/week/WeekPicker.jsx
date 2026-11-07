import { useEffect, useState } from "react";
import { api } from "../../shared/api/api";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { firstOfMonth, lastOfMonth, shiftMonth } from "../../shared/utils/calendar";
import { addDays, isoWeek, mondayOf } from "../../shared/utils/format";
import Button from "../ui/Button";
import MonthGrid from "../ui/MonthGrid";
import MonthNav from "../ui/MonthNav";
import { abForMonday } from "../../shared/utils/muster";
import { currentMonday } from "../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// Місячний календар «Woche wählen» (у шторці на телефоні і у випадаючому вікні на ПК).
// Клік по дню вибирає весь його тиждень.
//   сірі дні    — вихідні та meta.holidays (назв свят у даних немає — пишемо «frei»)
//   крапки      — Klausuren місяця (GET /api/exams?from=…&to=…)
//   A / B       — тиждень циклу школи біля номера KW (частина 19)
// onOpenWeek(понеділок) — натиснули «KW xx öffnen»
// ─────────────────────────────────────────────────────────────
const WeekPicker = ({ initialWeek, onOpenWeek }) => {
  const { today } = useNow(); // сьогодні
  const holidays = usePlanStore((s) => s.meta?.holidays); // вільні дні навчального року
  const abWeek = usePlanStore((s) => s.meta?.abWeek); // тиждень циклу зараз (1/2) — для букв A/B біля KW
  const [selected, setSelected] = useState(() => mondayOf(initialWeek ?? today)); // вибраний тиждень (понеділок)
  const [month, setMonth] = useState(() => firstOfMonth(initialWeek ?? today)); // показаний місяць
  const [examDays, setExamDays] = useState({}); // { "2026-10": Set дат із Klausuren }

  const free = new Set(holidays ?? []); // для швидкої перевірки

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

  // Сервер не віддає дати далі ніж 800 днів — далі не гортаємо
  const canGoNext = shiftMonth(month, 1) <= addDays(today, 790);

  return (
    <>
      {/* ── місяць і стрілки ── */}
      <MonthNav month={month} onChange={setMonth} canGoNext={canGoNext} />

      {/* ── календар: клік по дню вибирає його тиждень ── */}
      <MonthGrid month={month} today={today} highlight={selected} examDays={exams} freeDays={free} weekLetter={(monday) => abForMonday(monday, currentMonday(today), abWeek)} onPick={(day) => setSelected(mondayOf(day))} />

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
