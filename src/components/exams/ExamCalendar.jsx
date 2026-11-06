import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { firstOfMonth } from "../../shared/utils/calendar";
import { mondayOf } from "../../shared/utils/format";
import MonthGrid from "../ui/MonthGrid";
import MonthNav from "../ui/MonthNav";

// ─────────────────────────────────────────────────────────────
// Календар місяця праворуч від списку Klausuren (ПК, макет 14).
// Поточний тиждень підсвічено, сьогодні — кружечок, під днями з Klausur — крапка.
// exams — уже завантажені записи (майбутні і минулі): окремий запит не потрібен.
// Клік по дню з Klausur відкриває її, по іншому дню — сторінку дня.
// ─────────────────────────────────────────────────────────────
const ExamCalendar = ({ exams }) => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const navigate = useNavigate();
  // Показаний місяць. null — місяць «сьогодні»: на демо сьогодні приходить із сервера трохи пізніше
  const [picked, setMonth] = useState(null);
  const month = picked ?? firstOfMonth(today);

  const examDays = new Set(exams.map((exam) => exam.date));
  const pick = (day) => {
    const exam = exams.find((item) => item.date === day);
    if (exam) openSheet("klausur", { id: exam.id });
    else navigate(`/tag/${day}`);
  };

  return (
    <section aria-label="Kalender" className="flex flex-col gap-3 rounded-card bg-card p-4">
      <MonthNav month={month} onChange={setMonth} titleClassName="text-number" />
      <MonthGrid month={month} today={today} highlight={mondayOf(today)} rowShape="tile" examDays={examDays} onPick={pick} />
    </section>
  );
};

export default ExamCalendar;
