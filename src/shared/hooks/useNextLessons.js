import { useEffect } from "react";
import { usePlanStore } from "../store/planStore";
import { nextLessons } from "../utils/entries";
import { addDays, mondayOf } from "../utils/format";

// Следующие уроки предмета после урока from — из загруженных недель (план или Muster).
// Следующий урок обычно на этой или следующей неделе — их и подгружаем
export const useNextLessons = (subjectCode, from) => {
  const weeks = usePlanStore((s) => s.weeks);
  const loadWeek = usePlanStore((s) => s.loadWeek);
  const firstMonday = from?.date ? mondayOf(from.date) : null;

  useEffect(() => {
    if (!firstMonday) return;
    for (const monday of [firstMonday, addDays(firstMonday, 7)]) {
      if (!usePlanStore.getState().weeks[monday]) loadWeek(monday, { silent: true });
    }
  }, [firstMonday, loadWeek]);

  if (!from?.date) return [];
  const days = Object.values(weeks).flatMap((week) => week.data?.days ?? []);
  return nextLessons(days, subjectCode, from, 2);
};

