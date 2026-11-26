import { useAppointments } from "./useAppointments";
import { useNow } from "./useNow";
import { useDay, useLessonFilter } from "./usePlan";
import { useWeather } from "./useWeather";
import { usePlanStore } from "../store/planStore";
import { useFuerDichStore } from "../store/fuerDichStore";
import { useTasksStore } from "../store/tasksStore";
import { useUserStore } from "../store/userStore";
import { mySubjects } from "../utils/appointments";
import { mineOnly, nextSchoolDay } from "../utils/format";
import { nowFocus } from "../utils/nowFocus";
import { aufgabenList } from "../utils/tasks";

// ─────────────────────────────────────────────────────────────
// Собрать всё, что уже загружено, и спросить nowFocus (часть 50b): что показать сейчас.
// Сам ничего нового не загружает, кроме недели следующего учебного дня, погоды и Termine.
// → { focus, settings }
// ─────────────────────────────────────────────────────────────
export function useFuerDich() {
  const { now, today } = useNow();
  const settings = useFuerDichStore((s) => s.settings);
  const holidays = usePlanStore((s) => s.meta?.holidays) ?? [];
  const filter = useLessonFilter({ mine: true });
  const { weather } = useWeather();
  const { items: appointments } = useAppointments();

  const homework = usePlanStore((s) => s.homework);
  const tasks = useTasksStore((s) => s.tasks);
  const marks = useTasksStore((s) => s.marks);
  const allExams = usePlanStore((s) => s.exams);
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);

  const next = nextSchoolDay(today, holidays);
  const { day: todayDay } = useDay(today);
  const { day: nextDay } = useDay(next);

  // «Nur meine Kurse»: уроки и тесты только своих курсов; выключено — весь план класса
  const own = (day) => (day && day.status === "ok" ? { ...day, lessons: settings.onlyMine ? mineOnly(filter(day.lessons)) : day.lessons } : day);
  const mine = settings.onlyMine ? mySubjects(me, courses, picked, hiddenRequired) : null;
  const exams = mine ? allExams.filter((exam) => !exam.subject || mine.has(exam.subject.code)) : allExams;

  const focus = nowFocus({
    now,
    today,
    days: { [today]: own(todayDay), [next]: own(nextDay) },
    weather,
    homework: aufgabenList({ homework, tasks, marks, today }).open,
    exams,
    appointments,
    holidays,
    settings,
  });
  return { focus, settings };
}
