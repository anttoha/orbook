import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { appointmentsOn, countdown, dateText, lastDay, timeText } from "../../shared/utils/appointments";
import { firstOfMonth } from "../../shared/utils/calendar";
import { addDays, mondayOf } from "../../shared/utils/format";
import MonthGrid from "../ui/MonthGrid";
import MonthNav from "../ui/MonthNav";
import Liquid from "../ui/Liquid";

// Усі дні, які займають терміни (крапки в календарі)
const coveredDays = (items) => {
  const days = new Set();
  for (const item of items) for (let iso = item.dateFrom; iso <= lastDay(item); iso = addDays(iso, 1)) days.add(iso);
  return days;
};

// ─────────────────────────────────────────────────────────────
// Права колонка вкладки Termine на широкому ПК (макет 18 pc-01): «1 Tag bis Elternabend 9b» і місяць.
// Клік по дню з терміном відкриває його, по іншому дню — сторінку дня
// ─────────────────────────────────────────────────────────────
const AppointmentsAside = ({ next, items }) => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const navigate = useNavigate();
  const [picked, setMonth] = useState(null); // null — місяць «сьогодні»
  const month = picked ?? firstOfMonth(today);
  const card = next ? countdown(next, today) : null;

  const pick = (day) => {
    const found = appointmentsOn(items, day)[0];
    if (found) openSheet("termin", { id: found.id });
    else navigate(`/tag/${day}`);
  };

  return (
    <aside className="hidden w-exams-aside shrink-0 flex-col gap-4 desktop:flex">
      {next && (
        <button type="button" onClick={() => openSheet("termin", { id: next.id })} className="flex h-23.5 w-full items-center gap-4 rounded-card bg-accent px-4.5 text-left text-on-accent transition-shadow hover:shadow-raise">
          {card.number !== null && <span className="text-countdown-pc">{card.number}</span>}
          <span className="min-w-0">
            <span className="block text-hint font-extrabold text-today-sub">{card.number !== null ? (card.number === 1 ? "Tag bis" : "Tage bis") : card.label}</span>
            <span className="mt-0.5 block truncate text-input font-bold">{next.title}</span>
            <span className="mt-0.5 block truncate text-hint">
              {dateText(next)}
              {timeText(next) && ` · ${timeText(next)}`}
            </span>
          </span>
        </button>
      )}
      <Liquid as="section" refract press={false} aria-label="Kalender" className="flex flex-col gap-3 rounded-card bg-card p-4">
        <MonthNav month={month} onChange={setMonth} titleClassName="text-number" />
        <MonthGrid month={month} today={today} highlight={mondayOf(today)} rowShape="tile" examDays={coveredDays(items)} onPick={pick} />
      </Liquid>
    </aside>
  );
};

export default AppointmentsAside;
