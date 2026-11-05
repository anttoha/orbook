import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Button from "../components/ui/Button";
import OrbitMark from "../components/ui/OrbitMark";
import { PlanError, Skeleton } from "../components/ui/PlanState";
import CourseGroup from "../components/courses/CourseGroup";
import CourseRow from "../components/courses/CourseRow";
import StepBar from "../components/courses/StepBar";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { splitCourses, togglePicked } from "../shared/utils/courses";

// Тіло екрана для кожного стану завантаження курсів
const CourseLists = ({ status, courses, picked, onToggle, onRetry }) => {
  if (status === "loading") {
    return (
      <div role="status" aria-label="Kurse werden geladen" className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-7">
        <Skeleton className="h-67 rounded-card" />
        <Skeleton className="h-40.5 rounded-card" />
      </div>
    );
  }
  if (status === "error") {
    return <PlanError title="Kurse konnten nicht geladen werden" resource={{ error: { message: "Bitte prüfe deine Verbindung." } }} onRetry={onRetry} />;
  }
  if (courses.length === 0) {
    return <p className="rounded-card bg-card px-5 py-10 text-center text-body-sm text-muted">Noch keine Kurse. Der Plan wurde noch nicht geladen.</p>;
  }

  const { required, optional } = splitCourses(courses);
  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-7">
      <CourseGroup title="Pflicht">
        {required.map((course) => (
          <CourseRow key={course.nr} course={course} />
        ))}
      </CourseGroup>
      <CourseGroup title="Wahl">
        {optional.map((course) => (
          <CourseRow key={course.nr} course={course} checked={picked.includes(course.nr)} onChange={() => onToggle(course.nr)} />
        ))}
      </CourseGroup>
    </div>
  );
};

// Екран першого запуску «Welche Kurse hast du?» (макет 03).
// Вибір зберігається лише після «Weiter»: до цього він живе у стані екрана.
const CourseStart = () => {
  const courses = usePlanStore((s) => s.courses);
  const status = usePlanStore((s) => s.coursesStatus);
  const loadCourses = usePlanStore((s) => s.loadCourses);
  const logout = usePlanStore((s) => s.logout);
  const schoolClass = usePlanStore((s) => s.me?.className);
  const savedPicked = useUserStore((s) => s.picked);
  const finishCourseChoice = useUserStore((s) => s.finishCourseChoice);
  const [picked, setPicked] = useState(savedPicked);

  return (
    <div className="flex min-h-dvh flex-col bg-paper lg:px-11 lg:py-7">
      {/* шапка ПК */}
      <div className="hidden items-center gap-2 lg:flex">
        <OrbitMark className="size-7" />
        <p className="text-logo text-ink">ORBook</p>
        {schoolClass && <span className="rounded-full bg-sand px-1.75 py-1 text-room font-extrabold text-ink uppercase">{schoolClass}</span>}
      </div>

      <div className="flex flex-1 lg:items-center lg:justify-center">
        <main className="flex w-full flex-1 flex-col px-gutter pt-5.5 pb-7.5 lg:w-205 lg:flex-none lg:rounded-card lg:bg-card lg:px-9 lg:py-8 lg:shadow-sheet">
          <StepBar done={2} total={3} />

          <p className="mt-5 text-hint font-extrabold text-faint">Schritt 2 von 3</p>
          <h1 className="mt-1 text-title text-ink lg:text-welcome">Welche Kurse hast du?</h1>
          <p className="mt-3 mb-6 text-body-sm leading-5.25 text-muted lg:text-row">
            Nur deine Kurse erscheinen im Plan. Ändern kannst du das später unter <span className="lg:hidden">Mehr</span>
            <span className="hidden lg:inline">Einstellungen</span> → Meine Kurse.
          </p>

          <CourseLists status={status} courses={courses} picked={picked} onToggle={(nr) => setPicked((list) => togglePicked(list, nr))} onRetry={loadCourses} />

          <div className="mt-auto flex gap-2.5 pt-6 lg:justify-end">
            {/* Попередній крок — вхід. Сесія вже є, тому повернутись туди можна лише вийшовши */}
            <Button onClick={logout} className="flex-none px-4.5">
              Zurück
            </Button>
            {status === "ready" && (
              <Button variant="primary" onClick={() => finishCourseChoice(picked)} className="gap-1.5 lg:flex-none lg:px-4.5">
                <ChevronRight className="size-4" /> Weiter
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseStart;
