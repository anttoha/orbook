import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { checkPlans, shortDay } from "../../shared/utils/lernplan";
import Button from "../ui/Button";
import { TrashIcon, WarningIcon } from "../ui/icons";

// Одна карточка: «Test Mathe gelöscht · Fr 19.09. · Parabeln» и два ответа
const GoneCard = ({ id, plan }) => {
  const t = useT();
  const deletePlan = useTasksStore((s) => s.deletePlan);
  const keepPlan = useTasksStore((s) => s.keepPlan);
  const subject = plan.label ?? plan.subject ?? "";
  return (
    <div className="flex flex-col gap-3.5 rounded-card bg-sand p-3.5 motion-safe:animate-drop-in">
      <div className="flex gap-3">
        <WarningIcon className="mt-0.5 size-4.5 shrink-0 text-muted" />
        <div className="min-w-0">
          <p className="text-row font-extrabold text-ink">{t("Test {subject} gelöscht", { subject })}</p>
          <p className="mt-0.5 truncate text-caption text-muted">{[shortDay(plan.examDate), plan.title].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="danger" onClick={() => deletePlan(id)}>
          <TrashIcon className="size-4" /> {t("Lernplan löschen")}
        </Button>
        <Button className="bg-card" onClick={() => keepPlan(id)}>
          {t("Behalten")}
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Сверху в «Aufgaben» (макет 41 handy-07): тест, к которому есть Lernplan, удалили.
// Спрашиваем один раз: удалить задачи плана или оставить («Behalten» — plan.kept, больше не спрашиваем).
// Только по свежему списку тестов и только для открытого класса
// ─────────────────────────────────────────────────────────────
const GoneExamCards = () => {
  const { today } = useNow();
  const exams = usePlanStore((s) => s.exams);
  const ready = usePlanStore((s) => s.examsState.status === "ready");
  const cls = useClasses((s) => s.activeId);
  const tasks = useTasksStore((s) => s.tasks);
  if (!ready) return null;
  const { gone } = checkPlans(tasks, exams, cls, today);
  return gone.map(({ id, plan }) => <GoneCard key={id} id={id} plan={plan} />);
};

export default GoneExamCards;
