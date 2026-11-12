import { useLessonFilter } from "./usePlan";

// Видно ли урок: «Meine Kurse» скрывает чужие курсы, «Alle Kurse» показывает все (часть 22).
// Для «Verlauf des Tages» (часть 26): что показывать в ленте и в старой Fassung
export const useVisibleLesson = () => {
  const filter = useLessonFilter();
  return (lesson) => filter([lesson]).length > 0;
};
