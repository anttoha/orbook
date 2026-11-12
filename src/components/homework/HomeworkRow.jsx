import { cn } from "../../shared/utils/cn";
import { examWhen, subjectName } from "../../shared/utils/format";
import { authorShort } from "../../shared/utils/homework";
import { movedFromText } from "../../shared/utils/entries";
import MovedLine from "../entries/MovedLine";
import ExamDateTile from "../exams/ExamDateTile";

// ─────────────────────────────────────────────────────────────
// Рядок Hausaufgabe (макет handy-04):
//   [18 DO]  Mathe · von Mü                 morgen
//            Buch S. 54, Nr. 3 a–d
// Текст буває в кілька рядків — у списку лише перший. highlight — найближча (рамка)
// ─────────────────────────────────────────────────────────────
const HomeworkRow = ({ item, overrides, highlight, onClick }) => {
  const short = authorShort(item);
  const firstLine = item.text?.split("\n")[0] ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 rounded-card bg-card px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50", highlight && "border border-accent")}
    >
      <ExamDateTile exam={{ date: item.due, subject: item.subject }} overrides={overrides} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-note text-faint">
          {subjectName(item.subject)}
          {item.lesson && ` · ${item.lesson}. Std`}
          {short && ` · von ${short}`}
        </span>
        <span className="mt-1 block truncate text-row font-extrabold text-ink">{firstLine}</span>
        {movedFromText(item) && <MovedLine>{movedFromText(item)} – fiel aus</MovedLine>}
      </span>
      <span className={cn("shrink-0 text-caption font-bold", highlight ? "text-accent-ink" : "text-faint")}>{examWhen({ daysLeft: item.daysLeft, date: item.due })}</span>
    </button>
  );
};

export default HomeworkRow;
