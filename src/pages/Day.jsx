import AppointmentBanner from "../components/appointments/AppointmentBanner";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Eye, List } from "lucide-react";
import CurrentLessonCard from "../components/day/CurrentLessonCard";
import DayFreeState from "../components/day/DayFreeState";
import DayInfoBanner from "../components/day/DayInfoBanner";
import DayPageHeader from "../components/day/DayPageHeader";
import DaySkeleton from "../components/day/DaySkeleton";
import LessonList from "../components/day/LessonList";
import NextExamNote from "../components/day/NextExamNote";
import HomeworkDue from "../components/day/HomeworkDue";
import NotesSection from "../components/day/NotesSection";
import Timeline from "../components/day/Timeline";
import DayHeaderDesktop from "../components/day/desktop/DayHeaderDesktop";
import DayInfoCard from "../components/day/desktop/DayInfoCard";
import DayStrip from "../components/day/desktop/DayStrip";
import UpcomingCard from "../components/day/desktop/UpcomingCard";
import { FlagIcon, TimelineIcon } from "../components/ui/icons";
import NewPlanBanner from "../components/ui/NewPlanBanner";
import { PlanBanner, PlanDown, PlanError } from "../components/ui/PlanState";
import Segmented from "../components/ui/Segmented";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../shared/hooks/usePlan";
import { useSheet } from "../shared/hooks/useSheet";
import { useSwipe } from "../shared/hooks/useSwipe";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { isIsoDate, mondayOf, nextSchoolDay, subjectName, weekdayLong } from "../shared/utils/format";
import { lessonState } from "../shared/utils/lessonClock";
import { freeText, isPlanDown } from "../shared/utils/lessons";
import MusterNote from "../components/muster/MusterNote";
import PlanCheckBanner from "../components/muster/PlanCheckBanner";

// Варіанти перемикача вигляду
const VIEWS = [
  { value: "liste", label: "Liste", icon: List },
  { value: "zeitleiste", label: "Zeitleiste", icon: TimelineIcon },
];

// ─────────────────────────────────────────────────────────────
// Сторінка дня.
//   /tag/2026-10-07 — будь-який день
//   /heute          — сьогодні (datum в адресі немає)
// Вигляд (Liste / Zeitleiste) — настройка userStore.dayView, її ж змінює «Darstellung».
// День береться з тижня (GET /api/week), окремого запиту немає.
// Стан дня (day.status): ok — план є · holiday — вільно · not_published — плану ще немає ·
// unavailable — сервер школи недоступний. День із Muster (частина 19) приходить уже як ok з muster: true
// ─────────────────────────────────────────────────────────────
const Day = () => {
  const { datum } = useParams(); // дата з адреси (у /heute її немає)
  const { now, today } = useNow(); // час школи
  const { openSheet } = useSheet(); // відкрити шторку
  const navigate = useNavigate(); // перехід на інший день
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ≥ 1024px — комп'ютерний вигляд
  const filter = useLessonFilter(); // «Meine Kurse»
  const setAllCourses = useUserStore((s) => s.setAllCourses); // режим «Alle Kurse» (вибір не змінює)
  const holidays = usePlanStore((s) => s.meta?.holidays); // вільні дні (для гортання)
  const loadWeek = usePlanStore((s) => s.loadWeek); // «Erneut versuchen»
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // «Teilen» увімкнене?
  const lastStandShown = usePlanStore((s) => s.lastStandShown); // учень попросив збережений план

  const valid = !datum || isIsoDate(datum); // крива дата → на сьогодні
  const date = datum ?? today; // який день показуємо
  const { day, week } = useDay(valid ? date : null); // день + тиждень (стан завантаження)
  const storedView = useUserStore((s) => s.dayView); // збережений вигляд
  const view = storedView === "zeitleiste" ? "zeitleiste" : "liste"; // невідоме значення (старий запис) → список
  const setView = useUserStore((s) => s.setDayView);

  // Гарячі клавіші дня: ← → день, T сьогодні, L / Z вигляд.
  // (викликаємо до return нижче — хуки мають викликатися завжди)
  useHotkeys(
    {
      arrowleft: () => navigate(`/tag/${nextSchoolDay(date, holidays, -1)}`),
      arrowright: () => navigate(`/tag/${nextSchoolDay(date, holidays, 1)}`),
      t: () => navigate("/heute"),
      l: () => setView("liste"),
      z: () => setView("zeitleiste"),
    },
    valid, // для кривої дати клавіші не потрібні
  );

  // Свайп на телефоні: як стрілки в шапці, до сусіднього навчального дня
  const swipe = useSwipe({
    onLeft: () => navigate(`/tag/${nextSchoolDay(date, holidays, 1)}`),
    onRight: () => navigate(`/tag/${nextSchoolDay(date, holidays, -1)}`),
  });

  if (!valid) return <Navigate to="/heute" replace />;

  const reload = () => loadWeek(mondayOf(date)); // завантажити тиждень ще раз
  const openInfo = () => openSheet("info", { datum: date }); // для будь-якого дня, навіть без тексту школи
  const openLesson = (lesson) => openSheet("stunde", { datum: date, stunde: lesson.period, fach: lesson.subject?.code });

  const lessons = day?.status === "ok" ? filter(day.lessons) : []; // уроки без прихованих курсів
  const hiddenHere = day?.status === "ok" ? day.lessons.length - lessons.length : 0; // скільки сховано
  const live = day && date === today ? lessonState(lessons, now) : null; // що йде зараз (тільки сьогодні)
  const showLive = Boolean(live?.current || live?.next); // картка «Jetzt / Gleich»
  const free = day ? freeText(day) : null; // «Wochenende» / «Schulfrei» / «Plan fehlt noch»
  const isWeekendDay = day?.freeReason === "weekend"; // вихідні складаємо самі, вони не залежать від відповіді сервера
  const down = !isWeekendDay && isPlanDown(week, lastStandShown); // школа або сервер не відповідає
  const isLoading = !day && week.status !== "error"; // поки вантажиться, перемикач уже видно (макет «Tag · lädt»)

  // ── Блоки, однакові для телефону і ПК ──

  // Завантаження / помилка (поки дня немає)
  const loadingState = !day && (week.status === "error" ? <PlanError resource={week} onRetry={reload} /> : <DaySkeleton />);

  // День без плану: вихідний, свято, план ще не вийшов, школа не відповідає
  const freeState = free && <DayFreeState day={day} today={today} week={week} onRetry={reload} />;

  // Klausuren дня без плану: «Klausur: Mathe, 1. Stunde» (у звичайні дні вони видно на уроці)
  const examNotes =
    day && day.status !== "ok" && day.exams.length > 0 && (
      <div className="flex flex-col gap-2">
        {day.exams.map((exam) => (
          <p key={exam.id} className="flex items-center gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label text-accent-ink">
            <FlagIcon className="size-4 shrink-0" />
            <span>
              <span className="font-bold">{exam.type}:</span> {subjectName(exam.subject)}
              {exam.lesson && `, ${exam.lesson}. Stunde`}
            </span>
          </p>
        ))}
      </div>
    );

  // День із Muster (частина 19): плану ще немає, уроки — звичайні для цього дня тижня (макет 19 handy-03)
  const musterNote = day?.muster && (
    <MusterNote lead="Muster:">
      so ist der {weekdayLong(date)} normalerweise. Der echte Plan kommt meist am Vortag.
    </MusterNote>
  );
  const musterHint = day?.muster && <p className="px-1 text-caption text-faint">Notizen und Tests in Muster-Stunden prüft ORBook, sobald der echte Plan da ist.</p>;

  // Прийшов справжній план, а запис висить на уроці, якого вже немає → «Plan ist da · prüfen»
  const checkBanner = day && <PlanCheckBanner day={day} />;

  // План є, але всі уроки сховані
  const allHidden = day?.status === "ok" && lessons.length === 0 && (
    <div className="rounded-card bg-card px-4 py-10 text-center">
      <p className="text-subhead text-ink">Kein Unterricht</p>
      <p className="mt-1 text-label font-bold text-faint">{hiddenHere > 0 ? "Alle Kurse ausgeblendet" : "Keine Stunden"}</p>
    </div>
  );

  // Кнопка «показати сховані курси»
  const restoreHidden = hiddenHere > 0 && (
    <button type="button" onClick={() => setAllCourses(true)} className="flex items-center justify-center gap-2 text-label font-extrabold text-accent">
      <Eye className="size-4" /> {hiddenHere} {hiddenHere === 1 ? "Stunde" : "Stunden"} ausgeblendet · alle zeigen
    </button>
  );

  // ── ПК (макет «Tag · Liste» / «Tag · Zeitleiste») ──
  if (isDesktop) {
    return (
      <section className="flex flex-col gap-5">
        <DayHeaderDesktop
          date={date}
          today={today}
          day={day}
          view={view}
          onViewChange={setView}
          onInfo={openInfo}
          onShare={shareEnabled ? () => openSheet("teilen", { bereich: "heute", datum: date }) : null}
        />
        {week.data && <DayStrip days={week.data.days} date={date} today={today} />}
        <NewPlanBanner />
        <PlanBanner resource={week} onRetry={reload} />

        {/* ліва колонка — уроки, права (360px) — Info, нотатки, «Kommt noch».
            На 1024–1439px права колонка йде вниз */}
        <div className="grid items-start gap-9 desktop:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-3.5">
            {down ? (
              <PlanDown resource={week} onRetry={reload} />
            ) : (
              <>
                {loadingState}
                {checkBanner}
                {musterNote}
                {showLive && <CurrentLessonCard live={live} onOpen={openLesson} />}
                {freeState}
                {examNotes}
                {allHidden}
                {lessons.length > 0 && view === "liste" && <LessonList day={day} lessons={lessons} onOpen={openLesson} />}
                {lessons.length > 0 && view === "zeitleiste" && <Timeline day={day} lessons={lessons} onOpen={openLesson} />}
                {musterHint}
                {restoreHidden}
              </>
            )}
          </div>

          <aside className="grid content-start gap-4 lg:grid-cols-2 desktop:grid-cols-1">
            <AppointmentBanner date={date} />
            {day?.info.length > 0 && <DayInfoCard day={day} onOpen={openInfo} />}
            <HomeworkDue date={date} />
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
    <section {...swipe} className="flex flex-col gap-3">
      <DayPageHeader date={date} today={today} day={day} onInfo={openInfo} />
      <NewPlanBanner />

      {down ? (
        <PlanDown resource={week} onRetry={reload} />
      ) : (
        <>
          {(lessons.length > 0 || isLoading) && <Segmented label="Ansicht" options={VIEWS} value={view} onChange={setView} className="mt-0.5" />}

          <PlanBanner resource={week} onRetry={reload} />
          {day?.info.length > 0 && <DayInfoBanner info={day.info} onClick={openInfo} />}
          <AppointmentBanner date={date} />
          {checkBanner}
          {musterNote}

          {loadingState}
          {freeState}
          {examNotes}
          {allHidden}

          {/* вигляд «Liste» */}
          {lessons.length > 0 && view === "liste" && (
            <>
              {showLive && <CurrentLessonCard live={live} onOpen={openLesson} />}
              <div className="mt-0.5">
                <LessonList day={day} lessons={lessons} onOpen={openLesson} />
              </div>
            </>
          )}

          {/* вигляд «Zeitleiste» */}
          {lessons.length > 0 && view === "zeitleiste" && (
            <>
              <Timeline day={day} lessons={lessons} onOpen={openLesson} />
              <NextExamNote />
            </>
          )}

          {musterHint}
          {restoreHidden}

          <HomeworkDue date={date} />
          <NotesSection date={date} lessons={day?.lessons} hideEmpty={day?.status !== "ok"} />
        </>
      )}
    </section>
  );
};

export default Day;
