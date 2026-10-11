import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChartNoAxesColumn, ChevronRight, Flag } from "lucide-react";
import WeekGrid from "../components/week/WeekGrid";
import WeekMenu from "../components/week/WeekMenu";
import DayPanel from "../components/week/desktop/DayPanel";
import PeriodGrid from "../components/week/desktop/PeriodGrid";
import TimeGrid from "../components/week/desktop/TimeGrid";
import WeekAside from "../components/week/desktop/WeekAside";
import WeekHeaderDesktop from "../components/week/desktop/WeekHeaderDesktop";
import { PlanBanner, PlanError, Skeleton } from "../components/ui/PlanState";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useWeek } from "../shared/hooks/usePlan";
import { useSheet } from "../shared/hooks/useSheet";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { cn } from "../shared/utils/cn";
import { addDays, examWhen, isIsoDate, mondayOf, subjectName, weekHeading, weekSummaryText, weekTitle, weekdayShort } from "../shared/utils/format";
import { currentMonday, weekDays } from "../shared/utils/lessons";

// Кругла кнопка в шапці
const roundButton = "flex size-9.5 items-center justify-center rounded-full bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// ─────────────────────────────────────────────────────────────
// Сторінка тижня.  /woche?woche=2026-10-05  (понеділок у адресі)
//   ПК: ?ansicht=stunden — вигляд «Stunden + Tag», ?tag=… — вибраний день
// Дані: GET /api/week?date=<понеділок> (хук useWeek), Klausuren — з planStore.
// ─────────────────────────────────────────────────────────────
const Week = () => {
  const { today } = useNow(); // сьогодні (час школи)
  const { openSheet } = useSheet(); // відкрити шторку
  const navigate = useNavigate(); // перехід на іншу сторінку
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ≥ 1024px — комп'ютерний вигляд
  const [searchParams, setSearchParams] = useSearchParams(); // параметри адреси
  const showWeekend = useUserStore((s) => s.showWeekend); // показувати вихідні
  const exams = usePlanStore((s) => s.exams); // найближчі Klausuren
  const loadWeek = usePlanStore((s) => s.loadWeek); // завантажити тиждень ще раз
  const refreshPlan = usePlanStore((s) => s.refreshPlan); // «Plan neu laden»

  // Показаний тиждень живе в адресі (тому «Назад» зі сторінки дня повертає на той самий тиждень)
  const param = searchParams.get("woche");
  const monday = isIsoDate(param) ? mondayOf(param) : currentMonday(today);
  const week = useWeek(monday); // { status, data, savedAt, error }
  const days = week.data ? weekDays(week.data, showWeekend) : null; // дні для сітки (null — ще вантажиться)
  const lastDay = addDays(monday, showWeekend ? 6 : 4); // останній показаний день
  const title = weekTitle(monday, lastDay); // «KW 41 · 5.–9. Okt»
  const heading = weekHeading(monday, today); // «Diese Woche»
  const reload = () => loadWeek(monday); // кнопки «Erneut versuchen» / «Neu laden»

  // Поміняти параметр адреси (null — видалити); replace — без нового запису в історії
  const setParam = (key, value) => {
    setSearchParams(
      (prev) => {
        if (value == null) prev.delete(key);
        else prev.set(key, value);
        return prev;
      },
      { replace: true },
    );
  };
  const setWeek = (newMonday) => setParam("woche", newMonday); // інший тиждень
  const goToday = () => setWeek(currentMonday(today)); // поточний тиждень

  // Клік по уроку → шторка уроку (fach — бо паралельних курсів буває кілька)
  const openLesson = (day, lesson) => openSheet("stunde", { datum: day.date, stunde: lesson.period, fach: lesson.subject.code });

  // Гарячі клавіші тижня: ← → тиждень, T сьогодні, D Tagesansicht, R Plan neu laden
  useHotkeys({
    arrowleft: () => setWeek(addDays(monday, -7)),
    arrowright: () => setWeek(addDays(monday, 7)),
    t: goToday,
    d: () => navigate("/heute"),
    r: refreshPlan,
  });

  // Сітка або її стан: скелет / помилка
  const gridState = (grid) => {
    if (week.status === "error") return <PlanError resource={week} onRetry={reload} />;
    if (!days) return <Skeleton className={isDesktop ? "h-[560px]" : "h-[420px]"} />;
    return grid;
  };

  // ── ПК ──
  if (isDesktop) {
    const view = searchParams.get("ansicht") === "stunden" ? "stunden" : "zeitraster"; // вигляд тижня
    // Вибраний день для «Stunden + Tag»: з адреси (?tag=…), інакше сьогодні (якщо цей тиждень), інакше понеділок
    const tag = searchParams.get("tag");
    const inWeek = (iso) => iso >= monday && iso <= lastDay;
    const selectedDay = isIsoDate(tag) && inWeek(tag) ? tag : inWeek(today) ? today : monday;

    return (
      <section className="flex flex-col gap-6">
        <WeekHeaderDesktop
          monday={monday}
          subtitle={title}
          title={heading}
          view={view}
          onViewChange={(value) => setParam("ansicht", value === "stunden" ? "stunden" : null)}
          onWeekChange={setWeek}
          onToday={goToday}
        />

        <PlanBanner resource={week} onRetry={reload} />

        {/* сітка + права частина; на екрані ≥ 1440px — поруч, на 1024–1439px — права частина під сіткою */}
        <div className={cn("grid items-start gap-8", view === "stunden" ? "desktop:grid-cols-[minmax(0,1fr)_420px]" : "desktop:grid-cols-[minmax(0,1fr)_330px]")}>
          {view === "stunden" ? (
            <>
              {gridState(<PeriodGrid days={days} selectedDay={selectedDay} onSelectDay={(iso) => setParam("tag", iso)} onLessonClick={openLesson} />)}
              <DayPanel date={selectedDay} />
            </>
          ) : (
            <>
              {gridState(<TimeGrid days={days} onLessonClick={openLesson} />)}
              <WeekAside days={week.data?.days ?? []} />
            </>
          )}
        </div>
      </section>
    );
  }

  // ── Телефон ──
  const nextExam = exams[0]; // найближча Klausur (сервер віддає за датою)

  return (
    <section className="flex flex-col gap-3.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {/* «KW 41 · 5.–9. Okt» — по натисканню відкривається календар «Woche wählen» */}
          <button type="button" onClick={() => openSheet("kalender", { kw: monday })} className="block text-label leading-[0.8] font-extrabold text-faint">
            {title}
          </button>
          <h2 className="truncate text-title leading-[1.1] font-black text-ink">{heading}</h2>
        </div>
        {/* як на макеті: ‹ ⋮ › (календар — у меню «⋮» і по натисканню на рядок KW) */}
        <div className="flex shrink-0 gap-1.5">
          <button type="button" aria-label="Vorherige Woche" onClick={() => setWeek(addDays(monday, -7))} className={roundButton}>
            <ArrowLeft className="size-4.25" />
          </button>
          <WeekMenu monday={monday} onToday={goToday} onPickWeek={() => openSheet("kalender", { kw: monday })} />
          <button type="button" aria-label="Nächste Woche" onClick={() => setWeek(addDays(monday, 7))} className={roundButton}>
            <ArrowRight className="size-4.25" />
          </button>
        </div>
      </header>

      <PlanBanner resource={week} onRetry={reload} />

      {/* клік по уроку → шторка уроку; клік по дню — посилання всередині сітки */}
      {gridState(<WeekGrid days={days} onLessonClick={openLesson} />)}

      <div className="flex flex-col divide-y divide-hair rounded-[22px] bg-card px-3.5 text-faint">
        {/* найближча Klausur → сторінка цього дня */}
        {nextExam && (
          <Link to={`/tag/${nextExam.date}`} className="flex items-center gap-3 py-2">
            <Flag className="size-4.75 shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-body leading-5 font-medium text-ink">
                {weekdayShort(nextExam.date)} · {subjectName(nextExam.subject)}
              </h3>
              <p className="mt-0.5 truncate text-caption leading-4">
                Nächste {nextExam.type}
                {nextExam.topic && ` · ${nextExam.topic}`}
              </p>
            </div>
            <span className="shrink-0 text-label whitespace-nowrap">{examWhen(nextExam)}</span>
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        )}

        {/* підсумок тижня: «1 fällt aus · 3 Vertretungen · 2 Raumwechsel» */}
        {week.data && (
          <div className="flex items-center gap-3 py-4">
            <ChartNoAxesColumn className="size-4.75 shrink-0" />
            <h3 className="min-w-0 flex-1 text-body leading-5 font-medium text-ink">{weekSummaryText(week.data.summary)}</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default Week;
