import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { addDays, weekdayShort } from "../../shared/utils/format";
import { aufgabenList } from "../../shared/utils/tasks";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// «bis morgen», «bis Fr»; без срока — ничего
function dueText(due, today, t) {
  if (!due) return null;
  if (due < today) return t("überfällig");
  if (due === today) return t("bis heute");
  if (due === addDays(today, 1)) return t("bis morgen");
  return `${t("bis")} ${weekdayShort(due)}`;
}

// ─────────────────────────────────────────────────────────────
// Блок «Aufgaben» (макет handy-01): сколько открыто и ближайшая — домашки класса и свои задачи
// ─────────────────────────────────────────────────────────────
const AufgabenBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const homework = usePlanStore((s) => s.homework);
  const status = usePlanStore((s) => s.homeworkState.status);
  const names = usePlanStore((s) => s.meta?.subjects);
  const tasks = useTasksStore((s) => s.tasks);
  const marks = useTasksStore((s) => s.marks);
  const { open } = aufgabenList({ homework, tasks, marks, today });
  const first = open[0];

  const body = () => {
    if (!first) return status === "loading" && !tasks.length ? <BlockSkeleton /> : <BlockEmpty text="Nichts offen" />;
    const what = [first.subject && (names?.[first.subject] ?? first.subject), first.text].filter(Boolean).join(" · ");
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{open.length}</span>
          <span className="text-body-sm font-semibold text-muted">{t("offen")}</span>
        </p>
        <p className="mt-auto truncate text-body-sm font-semibold text-ink">{what}</p>
        {first.due && <p className="truncate text-caption font-bold text-accent-ink">{dueText(first.due, today, t)}</p>}
      </>
    );
  };

  return (
    <BlockCard kind="aufgaben" title={t("Aufgaben")} to="/testen?liste=hausaufgaben" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default AufgabenBlock;
