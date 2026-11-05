import { Link } from "react-router-dom";
import { usePlanStore } from "../../shared/store/planStore";
import { daysLeftText, subjectName, weekdayLong } from "../../shared/utils/format";
import { FlagIcon } from "../ui/icons";

// Плашка «In 2 Tagen: Klausur Mathe am Freitag, 2. Stunde» (під «Zeitleiste»).
// Найближча Klausur з GET /api/exams, якщо до неї не більше 7 днів
const NextExamNote = () => {
  const exam = usePlanStore((s) => s.exams.find((e) => e.daysLeft >= 0 && e.daysLeft <= 7));
  if (!exam) return null; // найближчим часом Klausuren немає

  const when = daysLeftText(exam.daysLeft); // «in 2 Tagen»
  return (
    <Link to={`/tag/${exam.date}`} className="flex items-center gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label text-accent-ink">
      <FlagIcon className="size-4 shrink-0" />
      <span>
        {/* перша літера велика: «In 2 Tagen:» */}
        <span className="font-bold">{when.charAt(0).toUpperCase() + when.slice(1)}:</span> {exam.type} {subjectName(exam.subject)} am {weekdayLong(exam.date)}
        {exam.lesson && `, ${exam.lesson}. Stunde`}
      </span>
    </Link>
  );
};

export default NextExamNote;
