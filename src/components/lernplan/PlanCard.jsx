import { Link, useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { useTasksStore } from "../../shared/store/tasksStore";
import { cn } from "../../shared/utils/cn";
import { dayLabel, maxDays, planDoneToast, planProgress, planTasksOf } from "../../shared/utils/lernplan";
import CheckCircle from "../tasks/CheckCircle";
import DoneText from "../tasks/DoneText";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { SparkIcon } from "../ui/icons";

// Все дни отмечены: вместо счёта — «Alles gelernt!» (просьба владельца «сделать интереснее»)
const AllDone = () => {
  const t = useT();
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3 motion-safe:animate-rise-in">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent motion-safe:animate-badge-pop">
        <SparkIcon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-subhead text-ink">{t("Alles gelernt!")}</span>
        <span className="block truncate text-caption text-muted">{t("Viel Erfolg beim Test!")}</span>
      </span>
    </div>
  );
};

// Один день плана: дата, тема, кружок. Сегодня — подсвечен
const PlanDay = ({ task, today, onToggle }) => {
  const isToday = task.due === today;
  return (
    <li className={cn("flex items-center gap-3 border-t border-hair pl-4 pr-1.5", isToday && !task.done && "bg-tint/60")}>
      <span className={cn("w-19 shrink-0 text-caption", isToday ? "font-extrabold text-accent-ink" : "font-bold text-faint")}>{dayLabel(task.due, today)}</span>
      {/* обёртка тянется, а сам текст — нет: линия зачёркивания ровно под словами */}
      <span className="min-w-0 flex-1">
        <DoneText done={task.done} className={cn("text-row", isToday ? "font-extrabold" : "font-bold")}>
          {task.text}
        </DoneText>
      </span>
      <CheckCircle done={task.done} label={task.text} onToggle={() => onToggle(task)} />
    </li>
  );
};

// ─────────────────────────────────────────────────────────────
// «Lernplan» в шторке теста (макеты 41 handy-01 и handy-03, pc-01).
// Плана нет — кнопка «Lernplan erstellen»; есть — «2 von 4 erledigt», полоска и дни с кружками.
// Кружок здесь и в «Aufgaben» — одна и та же задача.
// ─────────────────────────────────────────────────────────────
const PlanCard = ({ exam }) => {
  const t = useT();
  const navigate = useNavigate();
  const { today } = useNow();
  const tasks = useTasksStore((s) => s.tasks);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const planTasks = planTasksOf(tasks, exam.id);
  const editUrl = `/testen/${exam.id}/lernplan`;

  if (planTasks.length === 0) {
    if (maxDays(today, exam.date, true) === 0) return null; // учить уже некогда
    return (
      <Button variant="tint" className="flex-none" onClick={() => navigate(editUrl)}>
        <ListChecks className="size-4" /> {t("Lernplan erstellen")}
      </Button>
    );
  }

  const { done, total } = planProgress(planTasks);
  const toggle = (task) => {
    if (!task.done) toast(planDoneToast(planTasks, task.id));
    toggleTask(task.id);
  };

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-center justify-between text-hint font-extrabold text-faint">
        {t("Lernplan")}
        <Link to={editUrl} className="rounded-full text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          {t("Ändern")}
        </Link>
      </h3>
      <div className="overflow-hidden rounded-card bg-card">
        {done === total ? (
          <AllDone />
        ) : (
          <div className="px-4 pt-3.5 pb-3.5">
            <p className="text-row font-extrabold text-ink">{t("{done} von {total} erledigt", { done, total })}</p>
            <ProgressBar done={done} total={total} className="mt-2.5" />
          </div>
        )}
        <ul>
          {planTasks.map((task) => (
            <PlanDay key={task.id} task={task} today={today} onToggle={toggle} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PlanCard;
