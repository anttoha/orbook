import { ChevronRight } from "lucide-react";
import { useHomeworkDue } from "../../shared/hooks/useHomework";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { authorShort } from "../../shared/utils/homework";
import SubjectBadge from "../ui/SubjectBadge";

// ─────────────────────────────────────────────────────────────
// «Hausaufgaben · fällig heute» під уроками, над «Meine Notizen» (макет handy-07).
// Немає Hausaufgaben з таким терміном — блоку немає.
// ─────────────────────────────────────────────────────────────
const HomeworkDue = ({ date, className }) => {
  const { today } = useNow();
  const items = useHomeworkDue(date, today);
  const { openSheet } = useSheet();
  if (items.length === 0) return null;

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-hint font-extrabold text-faint">Hausaufgaben · {date === today ? "fällig heute" : "fällig an diesem Tag"}</h2>
      <ul className="rounded-card bg-card px-3.5">
        {items.map((item) => (
          <li key={item.id} className="border-b border-rule last:border-0">
            <button type="button" onClick={() => openSheet("hausaufgabe", { id: item.id })} className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <SubjectBadge subject={item.subject} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body text-ink">{item.text?.split("\n")[0]}</span>
                <span className="mt-0.5 block truncate text-caption text-faint">
                  {subjectName(item.subject)}
                  {authorShort(item) && ` · von ${authorShort(item)}`}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-faint" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeworkDue;
