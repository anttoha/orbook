import { useT } from "../../shared/hooks/useT";
import { degrees, rainFrom } from "../../shared/utils/weather";
import BlockCard from "../start/BlockCard";
import BlockEmpty from "../start/BlockEmpty";
import WeatherIcon from "../weather/WeatherIcon";
import { LessonList, PackChips } from "./FocusParts";
import { subjectName } from "../../shared/utils/format";

// «los in 25 min» / «los!»; время выхода неизвестно — ничего
const leaveAside = (focus, t) => (focus.leaveIn == null ? null : focus.leaveIn > 0 ? t("los in {n} min", { n: focus.leaveIn }) : t("los!"));

// «Heute bis 17° · Regen ab 13 Uhr»
function dayLine(day, t) {
  if (!day) return null;
  const rain = rainFrom(day);
  return [day.tMax != null && t("Heute bis {t}°", { t: day.tMax }), rain && t("Regen {from}", { from: rain })].filter(Boolean).join(" · ");
}

// ─────────────────────────────────────────────────────────────
// Утро до первого урока (макет 50 handy-01/02): погода к выходу, «Losgehen 07:05»,
// что надеть и взять, первые уроки с изменениями. Breit — одна строка урока, Klein — главное
// ─────────────────────────────────────────────────────────────
const FocusMorgen = ({ focus, size, editing, changes }) => {
  const t = useT();
  const temp = focus.leaveHour?.temp ?? focus.weatherDay?.tMax ?? null;
  const first = focus.lessons.find((l) => l.status !== "cancelled");
  const weatherBig = focus.weatherDay && (
    <span className="flex shrink-0 items-center gap-2">
      <WeatherIcon code={focus.leaveHour?.code ?? focus.weatherDay.code} className="size-9 text-ink lg:size-10" strokeWidth={1.8} />
      <span className="text-stat text-ink">{degrees(temp)}</span>
    </span>
  );

  if (size === "klein") {
    return (
      <BlockCard kind="fuerDich" accent title={t("Für dich")} aside={focus.leave} to="/heute" editing={editing}>
        {weatherBig ?? (first && <p className="truncate text-subhead text-ink">{subjectName(first.subject)}</p>)}
        <PackChips pack={focus.pack} max={1} className="mt-auto" />
      </BlockCard>
    );
  }

  const leaveText = focus.leave && t("Losgehen {time}", { time: focus.leave });
  return (
    <BlockCard kind="fuerDich" accent title={t("Für dich jetzt")} aside={leaveAside(focus, t)} to="/heute" editing={editing}>
      <div className="flex items-center gap-3.5">
        {weatherBig}
        {size === "breit" ? (
          first && (
            <p className="min-w-0 truncate text-body-sm text-muted">
              <span className="font-extrabold text-ink">{first.start}</span> {[subjectName(first.subject), first.room].filter(Boolean).join(" · ")}
            </p>
          )
        ) : (
          <div className="min-w-0">
            {leaveText && <p className="truncate text-body-sm font-extrabold text-muted">{leaveText}</p>}
            <p className="truncate text-caption text-faint">{dayLine(focus.weatherDay, t)}</p>
          </div>
        )}
      </div>
      <PackChips pack={focus.pack} max={size === "breit" ? 2 : 3} className="mt-3" />
      {size === "gross" && (
        <div className="mt-3 border-t border-hair pt-2">
          {focus.lessons.length ? <LessonList lessons={focus.lessons} changes={changes} /> : <BlockEmpty text={t("Plan fehlt noch")} />}
        </div>
      )}
    </BlockCard>
  );
};

export default FocusMorgen;
