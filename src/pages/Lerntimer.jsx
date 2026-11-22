import { useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, SkipForward, SlidersHorizontal, Square } from "lucide-react";
import DoneSheet from "../components/lerntimer/DoneSheet";
import { SubjectMinutes, WeekChart } from "../components/lerntimer/LernCharts";
import RoundDots from "../components/lerntimer/RoundDots";
import SettingsSheet from "../components/lerntimer/SettingsSheet";
import TimerRing from "../components/lerntimer/TimerRing";
import TodayList from "../components/lerntimer/TodayList";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Liquid from "../components/ui/Liquid";
import ListPicker from "../components/ui/ListPicker";
import RoundButton from "../components/ui/RoundButton";
import Segmented from "../components/ui/Segmented";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { useSubjectName } from "../shared/hooks/useKarten";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";
import { useTicker } from "../shared/hooks/useTicker";
import { translate } from "../shared/i18n/translate";
import { useLerntimerStore } from "../shared/store/lerntimerStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { formSubjects } from "../shared/utils/examRules";
import { breakAfter, bySubject, clockText, countedMinutes, durationText, endsAt, localDay, localTime, minutesOn, nextRound, progressOf, remainingMs, sessionsOn, timesOf, weekDays } from "../shared/utils/lerntimer";
import { fachClasses, fachDotClass } from "../shared/utils/lessons";
import { mySubjectCodes, subjectItems } from "../shared/utils/picker";
import { cn } from "../shared/utils/cn";

const PRESETS = [
  { value: "25", label: "25 / 5" },
  { value: "50", label: "50 / 10" },
  { value: "eigene", get label() { return translate("Eigene"); } },
];

// Предмет, пока таймер идёт (сменить можно только до старта): плашка цвета предмета
const SubjectPill = ({ code, text }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <p className={cn("mx-auto flex h-8.5 max-w-full items-center gap-2 truncate rounded-full px-3.5 text-body-sm font-extrabold motion-safe:animate-pop-in", fachClasses(code, overrides))}>
      <span className={`size-2.5 shrink-0 rounded-full ${fachDotClass(code, overrides)}`} />
      {text}
    </p>
  );
};

// Поле предмета (как в Karteikarten, часть 19c): мои предметы сверху, можно «Ohne Fach»
const SubjectField = ({ value, onChange }) => {
  const t = useT();
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const picked = useUserStore((s) => s.picked);
  const items = subjectItems(formSubjects(courses, picked, metaSubjects, null), mySubjectCodes(courses, picked));
  return <ListPicker id="lerntimer-fach" label={t("Fach")} clearable clearLabel={t("Ohne Fach")} placeholder={t("Ohne Fach")} items={items} value={value} onChange={onChange} />;
};

// Что показывает кольцо в каждом состоянии: подпись сверху, минуты, строка снизу
function ringText({ run, now, times, round, t }) {
  if (!run) return { top: t("Fokus"), time: clockText(times.focus * 60000), bottom: t("dann {min} min Pause", { min: breakAfter(round, times).minutes }) };
  const left = clockText(remainingMs(run, now));
  if (run.pausedAt) {
    const since = Math.floor((now - run.pausedAt) / 60000);
    return { top: t("Pausiert"), time: left, bottom: since < 1 ? t("gerade eben") : t("seit {n} min", { n: since }) };
  }
  const top = run.phase === "pause" ? (round >= times.rounds ? t("Lange Pause") : t("Pause")) : t("Fokus");
  return { top, time: left, bottom: t("fertig um {zeit}", { zeit: localTime(new Date(endsAt(run, now))) }) };
}

// ─────────────────────────────────────────────────────────────
// Lerntimer (часть 44, макеты handy-01…07, pc-01): /lerntimer
// Всё на устройстве (lerntimerStore) — загрузки нет. Время считается от старта (utils/lerntimer),
// конец фазы ловят «часы» на любой странице (useLerntimerClock в HomePage); здесь — только показ и кнопки.
// ПК: пробел — Start / Pause / Weiter, Esc — Stopp.
// ─────────────────────────────────────────────────────────────
const Lerntimer = () => {
  const t = useT();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const nameOf = useSubjectName();
  const { settings, sessions, run, done, code } = useLerntimerStore();
  const store = useLerntimerStore.getState();
  const now = useTicker(Boolean(run), run?.pausedAt ? 1000 : 250);
  const [sheet, setSheet] = useState(null); // "settings" | "custom" | "stop" | null
  const times = timesOf(settings);
  const round = Math.min(useLerntimerStore((s) => s.round), times.rounds);
  const today = localDay(new Date(now));
  const todayMin = minutesOn(sessions, today);

  const start = () => store.start(Date.now());
  const pauseOrResume = () => (run?.pausedAt ? store.resume(Date.now()) : store.pause(Date.now()));
  const askStop = () => run?.phase === "focus" && setSheet("stop");
  const choosePreset = (preset) => {
    store.setSettings({ preset });
    if (preset === "eigene") setSheet("custom");
  };
  useHotkeys({ " ": run ? (run.phase === "pause" ? store.skipBreak : pauseOrResume) : start, escape: askStop }, isDesktop && !sheet && !done);

  const ring = ringText({ run, now, times, round, t });
  const dotsDone = run?.phase === "pause" ? round : round - 1;
  const pillText = run?.phase === "pause" ? t("{fach} · gleich Runde {n}", { fach: nameOf(run.code), n: nextRound(round, times) }) : t("{fach} · Runde {n} von {total}", { fach: nameOf(run?.code), n: round, total: times.rounds });
  const brk = breakAfter(done?.round ?? round, times);
  const stopMin = run ? countedMinutes(run, now) : 0;

  const controls = () => {
    if (!run) {
      return (
        <Button variant="primary" onClick={start} className="w-full">
          <Play className="size-4.5" /> {t("Start")}
        </Button>
      );
    }
    if (run.phase === "pause") {
      return (
        <Button onClick={store.skipBreak} className="w-full">
          <SkipForward className="size-4.5" /> {t("Pause überspringen")}
        </Button>
      );
    }
    return (
      <div className="flex w-full gap-2">
        <Button onClick={askStop} className="flex-[0.7]">
          <Square className="size-4" /> {t("Stopp")}
        </Button>
        <Button variant="primary" onClick={pauseOrResume}>
          {run.pausedAt ? <Play className="size-4.5" /> : <Pause className="size-4.5" />} {run.pausedAt ? t("Weiter") : t("Pause")}
        </Button>
      </div>
    );
  };

  const timer = (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="h-14 w-full">{run ? <SubjectPill code={run.code} text={pillText} /> : <SubjectField value={code} onChange={store.setCode} />}</div>
      <TimerRing progress={progressOf(run, now)} phase={run?.phase} paused={Boolean(run?.pausedAt)} running={Boolean(run)} large={isDesktop} pulse={run?.startedAt ?? "bereit"} {...ring} />
      <RoundDots done={dotsDone} total={times.rounds} current={run?.phase === "pause" ? null : round} />
      {!run && <Segmented options={PRESETS} value={settings.preset} onChange={choosePreset} label={t("Zeiten")} className="w-full" />}
      <div className="w-full">{controls()}</div>
      {isDesktop && <p className="text-caption font-bold text-faint">{t("Leertaste: Start / Pause · Esc: Stopp")}</p>}
    </div>
  );

  const header = (
    <header className="flex items-end gap-2.5">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-hint font-extrabold text-faint">{t("Heute {zeit}", { zeit: durationText(todayMin) })}</p>
        <h1 className="truncate text-title text-ink lg:text-hero">{t("Lerntimer")}</h1>
      </div>
      <RoundButton onClick={() => setSheet("settings")} aria-label={t("Einstellungen")}>
        <SlidersHorizontal className="size-4.5" />
      </RoundButton>
    </header>
  );

  const todayList = <TodayList sessions={sessionsOn(sessions, today)} total={todayMin} />;

  return (
    <section className="flex flex-col gap-5.5">
      {isDesktop ? (
        <div className="grid grid-cols-5 items-start gap-9">
          <div className="col-span-3 flex flex-col gap-5.5">
            {header}
            <Liquid as="div" refract press={false} className="rounded-panel bg-card px-10 pt-8 pb-7">
              {timer}
            </Liquid>
          </div>
          <div className="col-span-2 flex flex-col gap-6 pt-20">
            {todayList}
            <WeekChart days={weekDays(sessions, today)} today={today} />
            <WeekSubjects sessions={sessions} today={today} />
          </div>
        </div>
      ) : (
        <>
          {header}
          {timer}
          {todayList}
        </>
      )}

      <DoneSheet done={done} rounds={times.rounds} today={todayMin} breakMin={brk.minutes} longBreak={brk.long} onBreak={() => store.takeBreak(Date.now())} onFinish={store.finishDay} onClose={store.closeDone} />
      {/* key: при каждом открытии черновик настроек берётся заново */}
      <SettingsSheet key={sheet ?? "zu"} open={sheet === "settings" || sheet === "custom"} custom={sheet === "custom"} onClose={() => setSheet(null)} />
      <ConfirmDialog
        open={sheet === "stop"}
        onClose={() => setSheet(null)}
        icon={<Square className="size-5 text-danger" />}
        title={t("Timer stoppen?")}
        text={stopMin >= 1 ? t("Die {min} Minuten {fach} werden trotzdem gezählt.", { min: stopMin, fach: nameOf(run?.code) }) : t("Weniger als eine Minute wird nicht gezählt.")}
      >
        <Button onClick={() => setSheet(null)}>{t("Abbrechen")}</Button>
        <Button
          variant="danger"
          onClick={() => {
            store.stop(Date.now());
            setSheet(null);
          }}
        >
          <Square className="size-4" /> {t("Stoppen")}
        </Button>
      </ConfirmDialog>
    </section>
  );
};

// ПК, справа: «Diese Woche nach Fach» и ссылка на «Statistik»
const WeekSubjects = ({ sessions, today }) => {
  const t = useT();
  const monday = weekDays(sessions, today)[0].day;
  const items = bySubject(sessions.filter((s) => !s.deleted && s.day >= monday && s.day <= today));
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="flex justify-between text-hint font-extrabold">
        <span className="text-faint">{t("Diese Woche nach Fach")}</span>
        <Link to="/statistik" className="text-accent-ink outline-none focus-visible:underline">
          {t("Statistik")}
        </Link>
      </h2>
      <SubjectMinutes items={items} />
    </section>
  );
};

export default Lerntimer;
