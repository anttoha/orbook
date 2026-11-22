import { useSubjectName } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { durationText } from "../../shared/utils/lerntimer";
import { weekdayShort } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";

// ─────────────────────────────────────────────────────────────
// Графики «Lernzeit» (часть 44): «Diese Woche nach Tag» и «Nach Fach».
// Нужны и в «Statistik» (handy-09), и справа от таймера на ПК (pc-01). Столбики растут, полоски заполняются
// ─────────────────────────────────────────────────────────────

// days — [{ day: "2026-09-17", min }] (utils/lerntimer weekDays), today — сегодняшний день подсвечен
export const WeekChart = ({ days, today, className }) => {
  const t = useT();
  const max = Math.max(...days.map((d) => d.min), 1);
  const summary = days.map((d) => `${weekdayShort(d.day)}: ${durationText(d.min)}`).join("; ");
  return (
    <Liquid as="section" refract press={false} className={cn("flex flex-col rounded-card bg-card px-4 pt-4 pb-3.5", className)}>
      <h2 className="flex justify-between text-hint font-extrabold text-faint">
        <span>{t("Diese Woche nach Tag")}</span>
        <span>{t("Minuten")}</span>
      </h2>
      <div role="img" aria-label={summary} className="mt-3 flex h-36 gap-2.5">
        {days.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 flex-col justify-end">
            {d.min > 0 ? (
              <div className="relative origin-bottom rounded-mark bg-accent motion-safe:animate-bar-grow" style={{ height: `${(d.min / max) * 82}%`, animationDelay: `${i * 50}ms` }}>
                <span className="absolute inset-x-0 bottom-full mb-1 text-center text-small font-extrabold text-muted">{d.min}</span>
              </div>
            ) : (
              <div className="h-1 rounded-full bg-sand" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2.5 text-small font-bold" aria-hidden="true">
        {days.map((d) => (
          <span key={d.day} className={cn("flex-1 text-center", d.day === today ? "text-accent-ink" : "text-faint")}>
            {weekdayShort(d.day)}
          </span>
        ))}
      </div>
    </Liquid>
  );
};

// items — [{ code, min }] (utils/lerntimer bySubject). Пусто — ничего
export const SubjectMinutes = ({ items }) => {
  const nameOf = useSubjectName();
  const overrides = useUserStore((s) => s.colorOverrides);
  if (items.length === 0) return null;
  const max = items[0].min || 1;
  return (
    <ul className="flex flex-col gap-2.25">
      {items.map((item, i) => {
        const dot = fachDotClass(item.code, overrides);
        return (
          <li key={item.code ?? "-"} className="flex h-5 items-center gap-2.5">
            <span className={`size-2.25 shrink-0 rounded-full ${dot}`} />
            <span className="w-22 shrink-0 truncate text-nav text-ink">{nameOf(item.code)}</span>
            <span className="h-2.25 flex-1 overflow-hidden rounded-full bg-sand">
              <span className={`block h-full origin-left rounded-full motion-safe:animate-bar-fill ${dot}`} style={{ width: `${(item.min / max) * 100}%`, animationDelay: `${i * 70}ms` }} />
            </span>
            <span className="w-22 shrink-0 text-right text-label font-extrabold text-ink tabular-nums">{durationText(item.min)}</span>
          </li>
        );
      })}
    </ul>
  );
};
