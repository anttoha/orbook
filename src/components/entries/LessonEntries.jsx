import { ChevronRight } from "lucide-react";
import { useSheet } from "../../shared/hooks/useSheet";
import { isMajorType } from "../../shared/utils/entries";
import Badge from "../ui/Badge";

// Серая строка рядом с бейджем Test: «Lernen: S. 40–58 · 2 Materialien»
const examNote = (exam) => {
  const parts = [];
  if (exam.details) parts.push(`Lernen: ${exam.details.split("\n")[0]}`);
  if (exam.materials?.length) parts.push(exam.materials.length === 1 ? "1 Material" : `${exam.materials.length} Materialien`);
  return parts.join(" · ");
};

const Row = ({ badge, note, title, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          {badge}
          {note && <span className="truncate text-caption text-faint">{note}</span>}
        </span>
        <span className="mt-1 block truncate text-body font-extrabold text-ink">{title}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" />
    </button>
  </li>
);

// ─────────────────────────────────────────────────────────────
// «Für diese Stunde» в окне урока (макет 24 handy-03): Tests и Hausaufgaben этого урока.
// Записей нет — блока нет. Нажатие — окно записи вместо окна урока (replace: «Назад» не вернёт сюда)
// ─────────────────────────────────────────────────────────────
const LessonEntries = ({ exams, homework }) => {
  const { openSheet } = useSheet();
  const count = exams.length + homework.length;
  if (count === 0) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-baseline justify-between text-hint font-extrabold text-faint">
        Für diese Stunde <span>{count === 1 ? "1 Eintrag" : `${count} Einträge`}</span>
      </h3>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {exams.map((exam) => (
          <Row key={`e${exam.id}`} badge={<Badge variant={isMajorType(exam.type) ? "exam" : "soft"}>{exam.type}</Badge>} note={examNote(exam)} title={exam.topic || exam.type} onClick={() => openSheet("klausur", { id: exam.id }, { replace: true })} />
        ))}
        {homework.map((item) => (
          <Row key={`h${item.id}`} badge={<Badge variant="soft">Hausaufgabe</Badge>} note="bis zu dieser Stunde" title={item.text?.split("\n")[0]} onClick={() => openSheet("hausaufgabe", { id: item.id }, { replace: true })} />
        ))}
      </ul>
    </section>
  );
};

export default LessonEntries;
