import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChartNoAxesGantt, Eye, Flag, List, RefreshCw } from "lucide-react";
import CurrentLessonCard from "../components/day/CurrentLessonCard";
import DayInfoBanner from "../components/day/DayInfoBanner";
import DayPageHeader from "../components/day/DayPageHeader";
import LessonList from "../components/day/LessonList";
import NextExamNote from "../components/day/NextExamNote";
import NotesSection from "../components/day/NotesSection";
import Timeline from "../components/day/Timeline";
import DayHeaderDesktop from "../components/day/desktop/DayHeaderDesktop";
import DayInfoCard from "../components/day/desktop/DayInfoCard";
import DayStrip from "../components/day/desktop/DayStrip";
import UpcomingCard from "../components/day/desktop/UpcomingCard";
import { PlanBanner, PlanError, Skeleton } from "../components/ui/PlanState";
import Segmented from "../components/ui/Segmented";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../shared/hooks/usePlan";
import { useSheet } from "../shared/hooks/useSheet";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { isIsoDate, longDate, mondayOf, nextSchoolDay, subjectName, weekdayLong, weekdayShort } from "../shared/utils/format";
import { lessonState } from "../shared/utils/lessonClock";
import { freeText } from "../shared/utils/lessons";

// Варіанти перемикача вигляду
const VIEWS = [
  { value: "liste", label: "Liste", icon: List },
  { value: "zeitleiste", label: "Zeitleiste", icon: ChartNoAxesGantt },
];

// ─────────────────────────────────────────────────────────────
// Сторінка дня.
//   /tag/2026-10-07 — будь-який день
//   /heute          — сьогодні (datum в адресі немає)
//   ?ansicht=zeitleiste — вигляд «Zeitleiste» замість «Liste»
// День береться з тижня (GET /api/week), окремого запиту немає.
// Стан дня (day.status): ok — план є · holiday — вільно · not_published — плану ще немає ·
// unavailable — сервер школи недоступний (тоді показуємо «очікувані» уроки expectedLessons)
// ─────────────────────────────────────────────────────────────
const Day = () => {
  const { datum } = useParams(); // дата з адреси (у /heute її немає)
  const { now, today } = useNow(); // час школи
  const [searchParams, setSearchParams] = useSearchParams(); // ?ansicht=…
  const { openSheet } = useSheet(); // відкрити шторку
  const navigate = useNavigate(); // перехід на інший день
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ≥ 1024px — комп'ютерний вигляд
  const filter = useLessonFilter(); // «Meine Kurse»
  const showAllCourses = useUserStore((s) => s.showAllCourses); // показати всі курси
  const holidays = usePlanStore((s) => s.meta?.holidays); // вільні дні (для гортання)
  const refreshPlan = usePlanStore((s) => s.refreshPlan); // «Jetzt prüfen»
  const loadWeek = usePlanStore((s) => s.loadWeek); // «Erneut versuchen»
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // «Teilen» увімкнене?

  const valid = !datum || isIsoDate(datum); // крива дата → на сьогодні
  const date = datum ?? today; // який день показуємо
  const { day, week } = useDay(valid ? date : null); // день + тиждень (стан завантаження)
  const view = searchParams.get("ansicht") === "zeitleiste" ? "zeitleiste" : "liste"; // поточний вигляд
  const search = view === "zeitleiste" ? "?ansicht=zeitleiste" : ""; // хвіст адреси для посилань на інші дні

  // Змінити вигляд (replace — не засмічуємо історію)
  const setView = (value) => {
    setSearchParams(
      (prev) => {
        if (value === "zeitleiste") prev.set("ansicht", value);
        else prev.delete("ansicht"); // «Liste» — вигляд за замовчуванням, в адресі не потрібен
        return prev;
      },
      { replace: true },
    );
  };

  // Гарячі клавіші дня: ← → день, T сьогодні, L / Z вигляд.
  // (викликаємо до return нижче — хуки мають викликатися завжди)
  useHotkeys(
    {
      arrowleft: () => navigate(`/tag/${nextSchoolDay(date, holidays, -1)}${search}`),
      arrowright: () => navigate(`/tag/${nextSchoolDay(date, holidays, 1)}${search}`),
      t: () => navigate(`/heute${search}`),
      l: () => setView("liste"),
      z: () => setView("zeitleiste"),
    },
    valid, // для кривої дати клавіші не потрібні
  );

  if (!valid) return <Navigate to="/heute" replace />;

  const reload = () => loadWeek(mondayOf(date)); // завантажити тиждень ще раз
  const openLesson = (lesson) => openSheet("stunde", { datum: date, stunde: lesson.period, fach: lesson.subject.code });

  const lessons = day?.status === "ok" ? filter(day.lessons) : []; // уроки без прихованих курсів
  const expected = day && day.status !== "ok" ? filter(day.expectedLessons) : []; // «vorläufig», поки плану немає
  const hiddenHere = day?.status === "ok" ? day.lessons.length - lessons.length : 0; // скільки сховано
  const live = day && date === today ? lessonState(lessons, now) : null; // що йде зараз (тільки сьогодні)
  const showLive = Boolean(live?.current || live?.next); // картка «Jetzt / Gleich»
  const free = day ? freeText(day) : null; // «Wochenende» / «Schulfrei» / «Plan fehlt noch»
  const next = nextSchoolDay(date, holidays); // наступний навчальний день

  // ── Блоки, однакові для телефону і ПК ──

  // Завантаження / помилка (поки дня немає)
  const loadingState = !day && (week.status === "error" ? <PlanError resource={week} onRetry={reload} /> : <Skeleton className="h-80" />);

  // День без плану: вихідний, свято, план ще не вийшов, школа не відповідає
  const freeState = free && (
    <div className="flex flex-col items-center gap-1 rounded-[22px] bg-card px-4 py-10 text-center">
      {day.status === "holiday" ? (
        <>
          <p className="text-subhead text-ink">{day.freeReason === "weekend" ? "Wochenende" : date === today ? "Heute ist frei" : "Kein Unterricht"}</p>
          <p className="text-label font-bold text-faint">{day.freeReason === "weekend" ? "Kein Unterricht" : "Schulfrei"}</p>
        </>
      ) : day.status === "not_published" ? (
        <>
          <p className="text-subhead text-ink">Plan für {weekdayLong(date)} fehlt noch</p>
          <p className="max-w-sm text-label font-semibold text-muted">Die Schule stellt den Plan meist am Vortag ab Mittag online. ORBook schaut regelmäßig nach.</p>
          <button type="button" onClick={refreshPlan} className="mt-2 flex items-center gap-1.5 rounded-full bg-sand px-4 py-2 text-label font-extrabold text-ink">
            <RefreshCw className="size-3.5" /> Jetzt prüfen
          </button>
        </>
      ) : (
        <>
          <p className="text-subhead text-ink">Plan nicht erreichbar</p>
          <p className="max-w-sm text-label font-semibold text-muted">stundenplan24.de antwortet nicht. Meist liegt das am Schulserver, nicht an dir.</p>
        </>
      )}
      {/* «Nächster Schultag · Mo, 6. Okt» */}
      {next && (
        <Link to={`/tag/${next}${search}`} className="mt-2 text-label font-extrabold text-accent">
          Nächster Schultag · {weekdayShort(next)}, {longDate(next)}
        </Link>
      )}
    </div>
  );

  // Klausuren дня без плану: «Klausur: Mathe, 1. Stunde» (у звичайні дні вони видно на уроці)
  const examNotes =
    day && day.status !== "ok" && day.exams.length > 0 && (
      <div className="flex flex-col gap-2">
        {day.exams.map((exam) => (
          <p key={exam.id} className="flex items-center gap-3 rounded-2xl bg-tint px-4 py-3 text-label font-bold text-accent-ink">
            <Flag className="size-4 shrink-0" /> {exam.type}: {subjectName(exam.subject)}
            {exam.lesson && `, ${exam.lesson}. Stunde`}
          </p>
        ))}
      </div>
    );

  // «Очікувані» уроки (сірим), поки плану немає
  const expectedState = expected.length > 0 && (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-label font-extrabold text-faint">Vorläufig (wie sonst an diesem Tag)</p>
      <LessonList day={day} lessons={expected} preliminary variant={isDesktop ? "inline" : "outside"} />
    </div>
  );

  // План є, але всі уроки сховані
  const allHidden = day?.status === "ok" && lessons.length === 0 && (
    <div className="rounded-[22px] bg-card px-4 py-10 text-center">
      <p className="text-subhead text-ink">Kein Unterricht</p>
      <p className="mt-1 text-label font-bold text-faint">{hiddenHere > 0 ? "Alle Kurse ausgeblendet" : "Keine Stunden"}</p>
    </div>
  );

  // Кнопка «показати сховані курси»
  const restoreHidden = hiddenHere > 0 && (
    <button type="button" onClick={showAllCourses} className="flex items-center justify-center gap-2 text-label font-extrabold text-accent">
      <Eye className="size-4" /> {hiddenHere} {hiddenHere === 1 ? "Stunde" : "Stunden"} ausgeblendet · einblenden
    </button>
  );

  // ── ПК (макет «Tag · Liste» / «Tag · Zeitleiste») ──
  if (isDesktop) {
    return (
      <section className="flex flex-col gap-5">
        <DayHeaderDesktop
          date={date}
          today={today}
          view={view}
          onViewChange={setView}
          search={search}
          onShare={shareEnabled ? () => openSheet("teilen", { bereich: "heute", datum: date }) : null}
        />
        {week.data && <DayStrip days={week.data.days} date={date} today={today} search={search} />}
        <PlanBanner resource={week} onRetry={reload} />

        {/* ліва колонка — уроки, права (360px) — Info, нотатки, «Kommt noch».
            На 1024–1439px права колонка йде вниз */}
        <div className="grid items-start gap-9 desktop:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-3.5">
            {loadingState}
            {showLive && <CurrentLessonCard live={live} onOpen={openLesson} />}
            {freeState}
            {examNotes}
            {expectedState}
            {allHidden}
            {lessons.length > 0 && view === "liste" && <LessonList day={day} lessons={lessons} onOpen={openLesson} variant="inline" />}
            {lessons.length > 0 && view === "zeitleiste" && <Timeline day={day} lessons={lessons} onOpen={openLesson} />}
            {restoreHidden}
          </div>

          <aside className="grid content-start gap-4 lg:grid-cols-2 desktop:grid-cols-1">
            {day?.info.length > 0 && <DayInfoCard day={day} onOpen={() => openSheet("info", { datum: date })} />}
            <NotesSection date={date} lessons={day?.lessons} variant="card" />
            <div className="lg:col-span-2 desktop:col-span-1">
              <UpcomingCard days={week.data?.days ?? []} today={today} />
            </div>
          </aside>
        </div>
      </section>
    );
  }

  // ── Телефон ──
  return (
    <section className="flex flex-col gap-3.5">
      <DayPageHeader date={date} today={today} search={search} />

      {lessons.length > 0 && <Segmented label="Ansicht" options={VIEWS} value={view} onChange={setView} />}

      <PlanBanner resource={week} onRetry={reload} />
      {day?.info.length > 0 && <DayInfoBanner info={day.info} onClick={() => openSheet("info", { datum: date })} />}

      {loadingState}
      {freeState}
      {examNotes}
      {expectedState}
      {allHidden}

      {/* вигляд «Liste» */}
      {lessons.length > 0 && view === "liste" && (
        <>
          {showLive && <CurrentLessonCard live={live} onOpen={openLesson} />}
          <LessonList day={day} lessons={lessons} onOpen={openLesson} />
        </>
      )}

      {/* вигляд «Zeitleiste» */}
      {lessons.length > 0 && view === "zeitleiste" && (
        <>
          <Timeline day={day} lessons={lessons} onOpen={openLesson} />
          <NextExamNote />
        </>
      )}

      {restoreHidden}

      <NotesSection date={date} lessons={day?.lessons} />
    </section>
  );
};

export default Day;
