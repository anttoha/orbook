import { useSheet } from "../../shared/hooks/useSheet";
import ExamCalendar from "./ExamCalendar";
import ExamCountdownCard from "./ExamCountdownCard";

// ─────────────────────────────────────────────────────────────
// Права колонка сторінки Klausuren на широкому ПК (макет 14):
// картка до найближчої Klausur і календар місяця.
// next — найближча (або null), all — усі завантажені записи для крапок у календарі
// ─────────────────────────────────────────────────────────────
const ExamsAside = ({ next, all }) => {
  const { openSheet } = useSheet();
  return (
    <aside className="hidden w-exams-aside shrink-0 flex-col gap-4 desktop:flex">
      {next && <ExamCountdownCard exam={next} onOpen={() => openSheet("klausur", { id: next.id })} />}
      <ExamCalendar exams={all} />
    </aside>
  );
};

export default ExamsAside;
