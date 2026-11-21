import { useEffect } from "react";
import { toast } from "sonner";
import { translate } from "../i18n/translate";
import { useClasses } from "../store/classesStore";
import { usePlanStore } from "../store/planStore";
import { useTasksStore } from "../store/tasksStore";
import { checkPlans, shiftPlan } from "../utils/lernplan";
import { useNow } from "./useNow";

// ─────────────────────────────────────────────────────────────
// Lernplan (часть 41): тест перенесли — несделанные дни плана сами переезжают к новой дате.
// Только по свежему списку тестов (status "ready"), не из кэша: старый кэш мог бы «перенести» план обратно.
// Эффект нужен: это реакция на ответ сервера, а меняем мы другое хранилище (tasksStore).
// После сдвига plan.examDate совпадает с датой теста — второй раз ничего не происходит.
// ─────────────────────────────────────────────────────────────
export function useLernplanShift(enabled) {
  const { today } = useNow();
  const exams = usePlanStore((s) => s.exams);
  const ready = usePlanStore((s) => s.examsState.status === "ready");
  const cls = useClasses((s) => s.activeId);
  const tasks = useTasksStore((s) => s.tasks);
  const replaceTasks = useTasksStore((s) => s.replaceTasks);

  useEffect(() => {
    if (!enabled || !ready) return;
    for (const { exam, tasks: planTasks } of checkPlans(tasks, exams, cls, today).moved) {
      const changed = shiftPlan(planTasks, exam.date, today);
      if (changed.length === 0) continue;
      replaceTasks(changed);
      toast(translate("Test verschoben · Lernplan angepasst"));
    }
  }, [enabled, ready, exams, tasks, cls, today, replaceTasks]);
}
