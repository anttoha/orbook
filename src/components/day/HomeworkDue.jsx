import { UserRound } from "lucide-react";
import { useHomeworkDue } from "../../shared/hooks/useHomework";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { authorShort } from "../../shared/utils/homework";
import { aufgabenOfDay } from "../../shared/utils/tasks";
import CheckCircle from "../tasks/CheckCircle";
import DoneText from "../tasks/DoneText";
import SubjectBadge from "../ui/SubjectBadge";

// Вторая строка: «Mathe · von Mü» у домашки, «Eigene Aufgabe» у своей
function subline(row, names) {
  if (row.kind === "own") return [ "Eigene Aufgabe", row.subject ? (names?.[row.subject] ?? row.subject) : null].filter(Boolean).join(" · ");
  return [subjectName(row.item.subject), authorShort(row.item) && `von ${authorShort(row.item)}`].filter(Boolean).join(" · ");
}

// ─────────────────────────────────────────────────────────────
// «Aufgaben · fällig …» под уроками, над «Meine Notizen» (макет 25 handy-05; было «Hausaufgaben», часть 14).
// Домашки этого дня + свои задачи на этот день, кружок — «erledigt». Ничего нет — блока нет.
// ─────────────────────────────────────────────────────────────
const HomeworkDue = ({ date, className }) => {
  const { today } = useNow();
  const homework = useHomeworkDue(date, today);
  const tasks = useTasksStore((s) => s.tasks);
  const marks = useTasksStore((s) => s.marks);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const markHomework = useTasksStore((s) => s.markHomework);
  const names = usePlanStore((s) => s.meta?.subjects);
  const { openSheet } = useSheet();
  const rows = aufgabenOfDay({ homework, tasks, marks, date });
  if (rows.length === 0) return null;
  const doneCount = rows.filter((row) => row.done).length;

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className="flex justify-between text-hint font-extrabold text-faint">
        <span>Aufgaben · {date === today ? "fällig heute" : "fällig an diesem Tag"}</span>
        {doneCount > 0 && <span>{doneCount} von {rows.length}</span>}
      </h2>
      <ul className="rounded-card bg-card pr-1.5 pl-3.5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center border-b border-rule last:border-0">
            <button
              type="button"
              onClick={() => (row.kind === "own" ? openSheet("aufgabe", { id: row.id }) : openSheet("hausaufgabe", { id: row.id }))}
              className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-98"
            >
              <span className={cn("shrink-0 transition-opacity duration-300", row.done && "opacity-50")}>
                {row.subject ? (
                  <SubjectBadge subject={{ code: row.subject }} />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-sand text-muted">
                    <UserRound className="size-4" />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <DoneText done={row.done} className="text-body">
                  {row.text}
                </DoneText>
                <span className={cn("mt-0.5 block truncate text-caption", row.kind === "own" && !row.done ? "text-accent-ink" : "text-faint")}>{subline(row, names)}</span>
              </span>
            </button>
            {/* детали — по нажатию на строку, справа — кружок «erledigt» */}
            <CheckCircle done={row.done} label={row.text} onToggle={() => (row.kind === "own" ? toggleTask(row.id) : markHomework(row.id, !row.done))} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeworkDue;
