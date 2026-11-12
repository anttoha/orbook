import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { useTasksStore } from "../../shared/store/tasksStore";
import { cn } from "../../shared/utils/cn";
import { dayNumber, examWhen, daysBetween, weekdayShort } from "../../shared/utils/format";
import { authorShort } from "../../shared/utils/homework";
import { movedFromText } from "../../shared/utils/entries";
import MovedLine from "../entries/MovedLine";
import ExamDateTile from "../exams/ExamDateTile";
import CheckCircle from "./CheckCircle";

// Плашка своей задачи без предмета: песочная, с днём или (без даты) со значком человека
const OwnTile = ({ due }) => (
  <span className="flex h-11 w-9.5 shrink-0 flex-col items-center justify-center rounded-tile bg-sand text-muted">
    {due ? (
      <>
        <span className="text-cell leading-none">{dayNumber(due).padStart(2, "0")}</span>
        <span className="mt-0.5 text-tiny font-bold tracking-badge uppercase">{weekdayShort(due)}</span>
      </>
    ) : (
      <UserRound className="size-4.5" />
    )}
  </span>
);

// «morgen» / «in 2 Tagen» / «12. Okt» — как у Tests
const whenText = (due, today) => (due ? examWhen({ daysLeft: daysBetween(today, due), date: due }) : null);

// Серая строка над текстом: «Eigene · Deutsch · morgen» или «Mathe · 2. Std · von Mü · morgen».
// «Eigene» и близкий срок — акцентом (пока не сделано)
function metaParts({ own, done, subject, lesson, author, when, soon }) {
  return [
    own && { text: "Eigene", className: cn("font-extrabold", !done && "text-accent-ink") },
    subject && { text: subject },
    lesson && { text: `${lesson}. Std` },
    author && { text: `von ${author}` },
    when && { text: when, className: cn(soon && "font-bold text-accent-ink") },
  ].filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// Строка «Aufgaben» (макет 25 handy-01, pc-01):
//   [18 DO]  Mathe · von Mü · morgen          ( )
//            Buch S. 54, Nr. 3 a–d
// Нажатие на строку — детали (домашка) или правка (своя). Кружок — «erledigt», видно только тебе.
// ─────────────────────────────────────────────────────────────
const AufgabeRow = ({ row, today, overrides, subjectNames, highlight, onOpen }) => {
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const markHomework = useTasksStore((s) => s.markHomework);
  const own = row.kind === "own";
  const when = whenText(row.due, today);
  const soon = when === "morgen" && !row.done;
  const subject = row.subject ? (subjectNames?.[row.subject] ?? row.item?.subject?.name ?? row.subject) : null;
  const author = own ? null : authorShort(row.item);
  const moved = own ? null : movedFromText(row.item);
  // Отметил «erledigt» — строка уезжает вниз, поэтому даём «Rückgängig»
  const flip = () => (own ? toggleTask(row.id) : markHomework(row.id, !row.done));
  const toggle = () => {
    flip();
    if (!row.done) toast("Erledigt", { duration: 5000, action: { label: "Rückgängig", onClick: flip } });
  };

  return (
    <div className={cn("flex items-center rounded-card bg-card pr-1.5", highlight && "border border-accent")}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 rounded-card py-2.5 pl-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <span className={cn("contents", row.done && "[&>*]:opacity-50")}>
          {row.subject && row.due ? <ExamDateTile exam={{ date: row.due, subject: { code: row.subject } }} overrides={overrides} /> : <OwnTile due={row.due} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-note text-faint">
            {metaParts({ own, done: row.done, subject, lesson: row.item?.lesson, author, when, soon }).map((part, i) => (
              <span key={part.text} className={part.className}>
                {i > 0 && " · "}
                {part.text}
              </span>
            ))}
          </span>
          <span className={cn("mt-1 block truncate text-row font-extrabold", row.done ? "text-faint line-through" : "text-ink")}>{row.text}</span>
          {moved && !row.done && <MovedLine>{moved} – fiel aus</MovedLine>}
        </span>
      </button>
      <CheckCircle done={row.done} label={row.text} onToggle={toggle} />
    </div>
  );
};

export default AufgabeRow;
