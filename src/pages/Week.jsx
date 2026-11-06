import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, ChartNoAxesColumn, ChevronLeft, ChevronRight } from "lucide-react";
import WeekGrid from "../components/week/WeekGrid";
import WeekMenu from "../components/week/WeekMenu";
import WeekUpdated from "../components/week/WeekUpdated";
import RefreshButton from "../components/week/RefreshButton";
import DayPanel from "../components/week/desktop/DayPanel";
import PeriodGrid from "../components/week/desktop/PeriodGrid";
import TimeGrid from "../components/week/desktop/TimeGrid";
import WeekAside from "../components/week/desktop/WeekAside";
import WeekHeaderDesktop from "../components/week/desktop/WeekHeaderDesktop";
import NewPlanBanner from "../components/ui/NewPlanBanner";
import { PlanBanner, PlanDown, PlanError, Skeleton } from "../components/ui/PlanState";
import WeekSkeleton from "../components/week/WeekSkeleton";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useWeek } from "../shared/hooks/usePlan";
import { useSheet } from "../shared/hooks/useSheet";
import { useSwipe } from "../shared/hooks/useSwipe";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { cn } from "../shared/utils/cn";
import { addDays, examWhen, isIsoDate, mondayOf, subjectName, weekHeading, weekSummaryText, weekTitle, weekdayShort } from "../shared/utils/format";
import { currentMonday, isWeekEmpty, weekDays, isPlanDown } from "../shared/utils/lessons";
import { FlagIcon } from "../components/ui/icons";
import { useAppointments } from "../shared/hooks/useAppointments";
import { timeText, upcomingAppointments, whenText } from "../shared/utils/appointments";

// Кругла кнопка в шапці
const roundButton = "flex size-9.5 items-center justify-center rounded-full bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// Рядок підсумку тижня. Статистику школа може вимкнути: тоді це просто текст
const WeekSummaryRow = ({ text, linked }) => {
  const body = (
    <>
      <ChartNoAxesColumn className="size-4.75 shrink-0" />
      <h3 className="min-w-0 flex-1 text-row leading-5 font-medium text-ink">{text}</h3>
      {linked && <ChevronRight className="size-4 shrink-0" />}
    </>
  );
  const className = cn("flex items-center gap-3 py-4", linked && "-mx-2 rounded-field px-2 hover:bg-paper");
  return linked ? (
    <Link to="/statistik" className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

// ─────────────────────────────────────────────────────────────
// Сторінка тижня.  /woche?woche=2026-10-05  (понеділок у адресі)
//   ПК: ?ansicht=stunden — вигляд «Stunden + Tag», ?tag=… — вибраний день
// Дані: GET /api/week?date=<понеділок> (хук useWeek), Klausuren — з planStore.
// ─────────────────────────────────────────────────────────────
const Week = () => {
  const { today } = useNow(); // сьогодні (час школи)
  const { openSheet } = useSheet(); // відкрити шторку
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ≥ 1024px — комп'ютерний вигляд
  const [searchParams, setSearchParams] = useSearchParams(); // параметри адреси
  const showWeekend = useUserStore((s) => s.showWeekend); // показувати вихідні
  const exams = usePlanStore((s) => s.exams); // найближчі Klausuren
  const loadWeek = usePlanStore((s) => s.loadWeek); // завантажити тиждень ще раз
  const { items: appointments } = useAppointments(); // Termine (частина 18)

  // Показаний тиждень живе в адресі (тому «Назад» зі сторінки дня повертає на той самий тиждень)
  const param = searchParams.get("woche");
  const monday = isIsoDate(param) ? mondayOf(param) : currentMonday(today);
  const week = useWeek(monday); // { status, data, savedAt, error }
  const days = week.data ? weekDays(week.data, showWeekend) : null; // дні для сітки (null — ще вантажиться)
  const lastDay = addDays(monday, showWeekend ? 6 : 4); // останній показаний день
  const title = weekTitle(monday, lastDay); // «KW 41 · 5.–9. Okt»
  const heading = weekHeading(monday, today); // «Diese Woche»
  const reload = () => loadWeek(monday); // кнопки «Erneut versuchen» / «Neu laden»
  const lastStandShown = usePlanStore((s) => s.lastStandShown); // учень попросив збережений план
  const down = isPlanDown(week, lastStandShown); // школа або сервер не відповідає: екран замість сітки

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
  const openLesson = (day, lesson) => openSheet("stunde", { datum: day.date, stunde: lesson.period, fach: lesson.subject?.code });

  // Гарячі клавіші тижня: ← → тиждень, T сьогодні (D, R і решта — useAppHotkeys в оболонці)
  useHotkeys({
    arrowleft: () => setWeek(addDays(monday, -7)),
    arrowright: () => setWeek(addDays(monday, 7)),
    t: goToday,
  });

  // Свайп по сторінці на телефоні: сусідній тиждень
  const swipe = useSwipe({ onLeft: () => setWeek(addDays(monday, 7)), onRight: () => setWeek(addDays(monday, -7)) });
  const statisticsEnabled = usePlanStore((s) => s.me?.features?.statistics !== false);

  // Без мережі час уже є в плашці «Offline · Stand von …», при збої рядка теж не треба
  const showUpdated = !down && week.status !== "offline";

  // Сітка або її стан: скелет / помилка
  const gridState = (grid) => {
    if (down) return <PlanDown resource={week} onRetry={reload} />;
    if (week.status === "error") return <PlanError resource={week} onRetry={reload} />;
    if (!days) return isDesktop ? <Skeleton className="h-140" /> : <WeekSkeleton />;
    if (isWeekEmpty(week.data?.days)) {
      // одна обгортка: на ПК це ОДНА клітинка сітки сторінки (інакше підпис і сітка розʼїжджаються по колонках)
      return (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card bg-card px-4 py-3">
            <p className="text-body-sm text-muted">Noch kein Plan für diese Woche. Die Schule veröffentlicht ihn meist kurz vorher.</p>
            <RefreshButton className="ml-auto" />
          </div>
          {grid}
        </div>
      );
    }
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

        {showUpdated && <WeekUpdated days={week.data?.days} />}

        <NewPlanBanner />
        {!down && <PlanBanner resource={week} onRetry={reload} />}

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
  // найближчий термін у показаному тижні (частина 18): рядок у картці під сіткою
  const nextAppointment = upcomingAppointments(appointments, today).find((item) => item.dateFrom <= lastDay && (item.dateTo ?? item.dateFrom) >= monday) ?? null;

  return (
    <section className="flex flex-col gap-3.5" {...swipe}>
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {/* «KW 41 · 5.–9. Okt» — по натисканню відкривається календар «Woche wählen» */}
          <button type="button" onClick={() => openSheet("kalender", { kw: monday })} className="block text-hint font-extrabold text-faint">
            {title}
          </button>
          <h1 className="truncate text-title text-ink">{heading}</h1>
        </div>
        {/* як на макеті: ‹ ⋮ › (календар — у меню «⋮» і по натисканню на рядок KW) */}
        <div className="flex shrink-0 gap-1.5">
          <button type="button" aria-label="Vorherige Woche" onClick={() => setWeek(addDays(monday, -7))} className={roundButton}>
            <ChevronLeft className="size-4.5" />
          </button>
          <WeekMenu monday={monday} onToday={goToday} onPickWeek={() => openSheet("kalender", { kw: monday })} />
          <button type="button" aria-label="Nächste Woche" onClick={() => setWeek(addDays(monday, 7))} className={roundButton}>
            <ChevronRight className="size-4.5" />
          </button>
        </div>
      </header>

      {showUpdated && <WeekUpdated days={week.data?.days} />}

      <NewPlanBanner />
      {!down && <PlanBanner resource={week} onRetry={reload} />}

      {/* клік по уроку → шторка уроку; клік по дню — посилання всередині сітки */}
      {gridState(<WeekGrid days={days} onLessonClick={openLesson} />)}

      {/* поки вантажиться, заглушка вже показує ці рядки; при збої їх немає зовсім (макет «Plan nicht erreichbar») */}
      {days && !down && (
        <div className="flex flex-col divide-y divide-hair rounded-card bg-card px-3.5 text-faint">
          {/* найближча Klausur → сторінка цього дня */}
          {nextExam && (
            <Link to={`/tag/${nextExam.date}`} className="flex items-center gap-3 py-2">
              <FlagIcon className="size-4.75 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-row leading-5 font-medium text-ink">
                  {weekdayShort(nextExam.date)} · {subjectName(nextExam.subject)}
                </h3>
                <p className="mt-0.5 text-caption leading-4">
                  Nächste {nextExam.type}
                  {nextExam.topic && ` · ${nextExam.topic}`}
                </p>
              </div>
              <span className="shrink-0 text-label whitespace-nowrap">{examWhen(nextExam)}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          )}

          {/* найближчий термін тижня → його вікно (макет 18 handy-09) */}
          {nextAppointment && (
            <button type="button" onClick={() => openSheet("termin", { id: nextAppointment.id })} className="flex items-center gap-3 py-4 text-left">
              <CalendarDays className="size-4.75 shrink-0 text-accent-ink" />
              <h3 className="min-w-0 flex-1 truncate text-row leading-5 font-medium text-ink">
                {weekdayShort(nextAppointment.dateFrom < today ? today : nextAppointment.dateFrom)} · {nextAppointment.title}
                {timeText(nextAppointment) && ` ${timeText(nextAppointment)}`}
              </h3>
              <span className="shrink-0 text-label whitespace-nowrap">{whenText(nextAppointment, today)}</span>
              <ChevronRight className="size-4 shrink-0" />
            </button>
          )}

          {/* підсумок тижня: «1 fällt aus · 3 Vertretungen · 2 Raumwechsel» */}
          <WeekSummaryRow text={weekSummaryText(week.data.summary)} linked={statisticsEnabled} />
        </div>
      )}
    </section>
  );
};

export default Week;
