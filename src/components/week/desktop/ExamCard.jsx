import { Link } from "react-router-dom";
import { cn } from "../../../shared/utils/cn";
import { dayNumber, examWhen, subjectName, weekdayShort } from "../../../shared/utils/format";
import { fachClasses } from "../../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// Картка Klausur у правій колонці (макет «Nächste Klausuren»):
//   [9 FR]  KLAUSUR Mathe · 2. Std        in 2 Tagen
//           Gleichungen und Funktionen
// exam — об'єкт з GET /api/exams: { type, subject, lesson, topic, date, daysLeft }
// highlight — найближча: фіолетова рамка і фіолетове «in 2 Tagen»
// ─────────────────────────────────────────────────────────────
const ExamCard = ({ exam, overrides, highlight }) => {
  const isKlausur = exam.type === "Klausur"; // Klausur — фіолетовий бейдж, Test/Abgabe — пісочний

  return (
    <Link
      to={`/tag/${exam.date}`}
      className={cn("flex items-center gap-3 rounded-[20px] bg-card p-3 transition-shadow hover:shadow-md", highlight && "ring-[1.5px] ring-accent")}
    >
      {/* дата в кольорі предмета */}
      <span className={cn("flex h-11 w-9.5 shrink-0 flex-col items-center justify-center rounded-xl", fachClasses(exam.subject.code, overrides))}>
        <span className="text-[19px] leading-none font-black">{dayNumber(exam.date)}</span>
        <span className="mt-0.5 text-tiny font-extrabold uppercase">{weekdayShort(exam.date)}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={cn("rounded-full px-2 py-0.75 text-micro leading-none font-extrabold tracking-wide uppercase", isKlausur ? "bg-accent text-on-accent" : "bg-sand text-muted")}>
            {exam.type}
          </span>
          <span className="truncate text-caption font-semibold text-faint">
            {subjectName(exam.subject)}
            {exam.lesson && ` · ${exam.lesson}. Std`}
          </span>
        </span>
        {/* тема (може бути порожньою) */}
        <span className="mt-1 block truncate text-body font-extrabold text-ink">{exam.topic || subjectName(exam.subject)}</span>
      </span>

      <span className={cn("shrink-0 text-caption", highlight ? "font-extrabold text-accent-ink" : "font-semibold text-faint")}>{examWhen(exam)}</span>
    </Link>
  );
};

export default ExamCard;
