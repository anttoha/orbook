import { Check, Minus, RefreshCw } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useTicker } from "../../shared/hooks/useTicker";
import { useWeekCheck } from "../../shared/hooks/useWeekCheck";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { addDays, isoWeek, numericDate, weekdayShort } from "../../shared/utils/format";
import { currentMonday } from "../../shared/utils/lessons";
import { askedText, dayCheck } from "../../shared/utils/liveText";
import { Skeleton } from "../ui/PlanState";
import LiveDot from "./LiveDot";
import PillButton from "../ui/PillButton";
import Liquid from "../ui/Liquid";

// Значок справа в строке дня: ✓ план есть · пунктирный круг — плана ещё нет · «?» — не проверяли · «–» — свободно
const Mark = ({ kind, index }) => {
  const delay = { animationDelay: `${120 + index * 70}ms` }; // галочки появляются по очереди
  if (kind === "ok")
    return (
      <span style={delay} className="grid size-5 place-items-center rounded-full bg-ok-tint text-ok motion-safe:animate-badge-pop">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  if (kind === "none") return <span className="size-5 rounded-full border-[1.5px] border-dashed border-faint2" />;
  if (kind === "unknown") return <span className="grid size-5 place-items-center rounded-full bg-sand text-tiny font-extrabold text-muted">?</span>;
  return (
    <span className="grid size-5 place-items-center rounded-full bg-sand text-faint">
      <Minus className="size-3" />
    </span>
  );
};

// Зелёная карточка «Live verbunden» / песочная «Gerade nicht live»
const LiveCard = ({ live, compact }) => (
  <div className={cn("flex items-center gap-3 rounded-tile px-4 transition-colors duration-500", compact ? "py-3" : "py-3.5", live ? "bg-ok-tint" : "bg-sand")}>
    <LiveDot on={live} size="md" />
    <div className="min-w-0">
      <p className={cn("text-row font-extrabold", live ? "text-ok" : "text-ink")}>{live ? "Live verbunden" : "Gerade nicht live"}</p>
      <p className="text-caption text-muted">{live ? (compact ? "Ein neuer Plan erscheint von selbst." : "Ein neuer Plan erscheint von selbst – in Sekunden.") : "ORBook fragt stattdessen jede Minute nach."}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Plan-Status» (часть 26, макеты handy-09…11, pc-03): связь Live, что проверено по каждому дню недели,
// когда школу спрашивали и «Diese Woche jetzt prüfen». monday — неделя на экране.
// Общее для шторки (телефон) и окошка над левым меню (ПК, compact).
// ─────────────────────────────────────────────────────────────
const PlanStatusBody = ({ monday, compact = false }) => {
  const { today } = useNow();
  const now = useTicker();
  const live = usePlanStore((s) => s.live) === "live";
  const status = usePlanStore((s) => s.status);
  const refreshing = usePlanStore((s) => s.refreshing);
  const refreshPlan = usePlanStore((s) => s.refreshPlan);
  const week = useWeekCheck(monday);
  const thisWeek = monday === currentMonday(today);

  return (
    <div className="flex flex-col gap-4">
      <LiveCard live={live} compact={compact} />

      <section className="flex flex-col gap-2">
        <h3 className="text-label font-extrabold text-faint">
          {thisWeek ? "Diese Woche" : `${numericDate(monday)}–${numericDate(addDays(monday, 4))}`} · KW {isoWeek(monday)}
        </h3>
        <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
          {week.state === "loading" &&
            [0, 1, 2, 3, 4].map((i) => (
              <li key={i} className={cn("flex items-center gap-3", compact ? "h-9.5" : "h-11.5")}>
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-40" />
              </li>
            ))}
          {week.state === "error" && <li className="py-3.5 text-caption text-muted">Die Tage kommen gerade nicht an.</li>}
          {week.state === "ready" &&
            week.days.map((day, i) => {
              const check = dayCheck(day, today, now);
              // в узком окошке на ПК — без повторяющегося начала строки (макет pc-03)
              const text = compact ? check.text.replace("Plan da · ", "").replace("Noch kein Plan · ", "kein Plan · ") : check.text;
              const isToday = day.date === today;
              return (
                <li key={day.date} style={{ animationDelay: `${i * 50}ms` }} className={cn("flex items-center gap-3 motion-safe:animate-rise-in", compact ? "h-9.5" : "h-11.5")}>
                  <span className={cn("w-12 shrink-0 text-row font-extrabold", isToday ? "text-accent-ink" : "text-ink")}>
                    {weekdayShort(day.date)} {numericDate(day.date).split(".")[0]}.
                  </span>
                  <span className={cn("min-w-0 flex-1 truncate text-label", check.kind === "unknown" || check.kind === "free" ? "text-faint" : "text-muted")}>{text}</span>
                  <Mark kind={check.kind} index={i} />
                </li>
              );
            })}
        </Liquid>
        <p className="text-caption text-faint">{askedText(status, now)}</p>
      </section>

      <PillButton glass="filled" size="lg"
       
        disabled={refreshing}
        onClick={() => refreshPlan(monday)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-row font-bold text-on-accent transition-opacity active:opacity-80 disabled:opacity-60">
        <RefreshCw className={cn("size-4", refreshing && "motion-safe:animate-spin")} />
        {refreshing ? "Wird geprüft…" : thisWeek ? "Diese Woche jetzt prüfen" : "Diese Woche prüfen"}
      </PillButton>
    </div>
  );
};

export default PlanStatusBody;
