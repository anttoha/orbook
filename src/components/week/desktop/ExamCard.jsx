import { Link } from "react-router-dom";
import { cn } from "../../../shared/utils/cn";
import { examWhen, subjectName } from "../../../shared/utils/format";
import ExamBadge from "../../exams/ExamBadge";
import ExamDateTile from "../../exams/ExamDateTile";

// ─────────────────────────────────────────────────────────────
// Картка Klausur у правій колонці (макет «Nächste Klausuren»):
//   [9 FR]  KLAUSUR Mathe · 2. Std        in 2 Tagen
//           Gleichungen und Funktionen
// exam — об'єкт з GET /api/exams: { type, subject, lesson, topic, date, daysLeft }
// highlight — найближча: фіолетова рамка і фіолетове «in 2 Tagen»
// ─────────────────────────────────────────────────────────────
const ExamCard = ({ exam, overrides, highlight }) => {
  return (
    <Link
      to={`/tag/${exam.date}`}
      className={cn("flex items-center gap-3 rounded-box bg-card p-3 transition-shadow hover:shadow-raise", highlight && "ring-[1.5px] ring-accent")}
    >
      <ExamDateTile exam={exam} overrides={overrides} />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <ExamBadge type={exam.type} />
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
