import { Link } from "react-router-dom";
import { useNow } from "../../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../../shared/hooks/usePlan";
import { useSheet } from "../../../shared/hooks/useSheet";
import { usePlanStore } from "../../../shared/store/planStore";
import { useUserStore } from "../../../shared/store/userStore";
import { lessonState } from "../../../shared/utils/lessonClock";
import CurrentLessonCard from "../../day/CurrentLessonCard";
import DayInfoBanner from "../../day/DayInfoBanner";
import ExamCard from "./ExamCard";
import WeekStatsCard from "./WeekStatsCard";

// ─────────────────────────────────────────────────────────────
// Права колонка тижня на ПК (макет «Seitenspalte», ширина 330px):
// «Jetzt» · Info zum Tag · Nächste Klausuren · статистика тижня.
// На екранах 1024–1439px вона стоїть під сіткою (дві колонки карток).
// days — дні показаного тижня (Mo–Fr)
// ─────────────────────────────────────────────────────────────
const WeekAside = ({ days }) => {
  const { now, today } = useNow(); // час школи
  const { openSheet } = useSheet(); // відкрити шторку
  const filter = useLessonFilter(); // «Meine Kurse»
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const exams = usePlanStore((s) => s.exams).slice(0, 3); // 3 найближчі Klausuren (GET /api/exams)
  const { day: todayDay } = useDay(today); // сьогоднішній день (може бути в іншому тижні)

  const live = todayDay ? lessonState(filter(todayDay.lessons), now) : null; // що йде зараз
  const showLive = live && (live.current || live.next); // картка «Jetzt / Gleich»

  return (
    <aside className="grid content-start gap-4 lg:grid-cols-2 desktop:grid-cols-1 print:hidden">
      {showLive && <CurrentLessonCard live={live} onOpen={(lesson) => openSheet("stunde", { datum: today, stunde: lesson.period, fach: lesson.subject.code })} />}
      {todayDay?.info.length > 0 && <DayInfoBanner info={todayDay.info} onClick={() => openSheet("info", { datum: today })} />}

      {/* Nächste Klausuren */}
      {exams.length > 0 && (
        <section className="flex flex-col gap-2 lg:col-span-2 desktop:col-span-1">
          <header className="mt-1 flex items-center justify-between px-0.5">
            <h2 className="text-label font-extrabold text-muted">Nächste Klausuren</h2>
            <Link to="/testen" className="text-label font-extrabold text-accent">
              Alle
            </Link>
          </header>
          {exams.map((exam, i) => (
            <ExamCard key={exam.id} exam={exam} overrides={overrides} highlight={i === 0} />
          ))}
        </section>
      )}

      <WeekStatsCard days={days} />
    </aside>
  );
};

export default WeekAside;
