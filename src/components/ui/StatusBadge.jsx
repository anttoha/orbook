import { lessonBadge } from "../../shared/utils/format";
import Badge from "./Badge";

// Бейдж уроку: FÄLLT AUS / VERTRETUNG / RAUM / KLAUSUR (або нічого).
// exam — Klausur цього уроку (якщо є): тоді пишемо її тип — «Klausur», «Test», «Abgabe»
const StatusBadge = ({ lesson, exam, className }) => {
  const label = lessonBadge(lesson); // текст бейджа за статусом
  if (!label) return null; // звичайний урок — без бейджа
  if (lesson.examId) return <Badge variant="exam" className={className}>{exam?.type ?? "Klausur"}</Badge>;
  return (
    <Badge variant={lesson.status === "cancelled" ? "cancelled" : "changed"} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
