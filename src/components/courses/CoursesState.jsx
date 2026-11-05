import { PlanError, Skeleton } from "../ui/PlanState";
import { usePlanStore } from "../../shared/store/planStore";

// Курси ще вантажаться, не завантажились або їх немає: той самий вигляд на всіх екранах
// зі списком курсів. Коли все гаразд, показує children.
const CoursesState = ({ children }) => {
  const courses = usePlanStore((s) => s.courses);
  const status = usePlanStore((s) => s.coursesStatus);
  const loadCourses = usePlanStore((s) => s.loadCourses);

  if (status === "loading") {
    return (
      <div role="status" aria-label="Kurse werden geladen" className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-7">
        <Skeleton className="h-67 rounded-card" />
        <Skeleton className="h-40.5 rounded-card" />
      </div>
    );
  }
  if (status === "error") {
    return <PlanError title="Kurse konnten nicht geladen werden" resource={{ error: { message: "Bitte prüfe deine Verbindung." } }} onRetry={loadCourses} />;
  }
  if (courses.length === 0) {
    return <p className="rounded-card bg-card px-5 py-10 text-center text-body-sm text-muted">Noch keine Kurse. Der Plan wurde noch nicht geladen.</p>;
  }
  return children;
};

export default CoursesState;
