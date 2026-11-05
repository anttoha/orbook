import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Button from "../components/ui/Button";
import OrbitMark from "../components/ui/OrbitMark";
import CourseLists from "../components/courses/CourseLists";
import StepBar from "../components/courses/StepBar";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { togglePicked } from "../shared/utils/courses";

// Екран першого запуску «Welche Kurse hast du?» (макет 03).
// Вибір зберігається лише після «Weiter»: до цього він живе у стані екрана.
const CourseStart = () => {
  const status = usePlanStore((s) => s.coursesStatus);
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

          <CourseLists isOn={(nr) => picked.includes(nr)} onToggle={(nr) => setPicked((list) => togglePicked(list, nr))} />

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
