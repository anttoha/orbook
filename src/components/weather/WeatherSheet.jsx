import { DoorOpen, Droplet, Wind } from "lucide-react";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { useWeather } from "../../shared/hooks/useWeather";
import { weekdayLong } from "../../shared/utils/format";
import { berlinParts } from "../../shared/utils/lessonClock";
import { dayOf, degrees, hourAt, leaveLine, leaveTime, rainFrom, schoolHours, standLabel, weatherTips } from "../../shared/utils/weather";
import Liquid from "../ui/Liquid";
import Sheet from "../ui/Sheet";
import HourStrip from "./HourStrip";
import TipChips from "./TipChips";
import WeatherIcon from "./WeatherIcon";

// Сколько минут до первого урока выходить (в части 50b — своя настройка «Losgehen vorher»)
const LEAVE_MINUTES = 45;

// ─────────────────────────────────────────────────────────────
// Шторка «Wetter» (макет 50 handy-06). Адрес: ?sheet=wetter&datum=2026-11-26
// Сверху день, потом «Losgehen» (если в этот день есть свои уроки), часы 07–14, «Stand · Open-Meteo»
// ─────────────────────────────────────────────────────────────
const WeatherSheet = ({ open, onClose, sheet }) => {
  const t = useT();
  const { weather } = useWeather();
  const { day: planDay } = useDay(sheet.datum);
  const filter = useLessonFilter(); // «Meine Kurse»
  const { now, today } = useNow();
  const day = dayOf(weather, sheet.datum);
  if (!day) return null;

  const lessons = planDay?.status === "ok" || planDay?.muster ? filter(planDay.lessons) : [];
  const leave = leaveTime(lessons, LEAVE_MINUTES);
  const atLeave = hourAt(day, leave);
  const leaveInfo = leaveLine(atLeave);
  const tips = weatherTips(day, atLeave);
  const hours = schoolHours(day);
  const nowHour = sheet.datum === today ? Math.floor(berlinParts(now).minutes / 60) : null; // час школы, не устройства
  const rain = [day.rainMax != null ? `${day.rainMax} %` : null, rainFrom(day)].filter(Boolean).join(" ");
  const stand = standLabel(weather.updatedAt);

  return (
    <Sheet open={open} onClose={onClose} panelLabel={t("Wetter")} eyebrow={`${weekdayLong(day.date)} · ${weather.place?.name ?? ""}`} title={t("Wetter")}>
      {/* день крупно: значок, «17° / 9°», справа дождь и ветер */}
      <div className="flex items-center gap-3">
        <WeatherIcon code={day.code} className="size-12 shrink-0 text-ink" strokeWidth={1.6} />
        <p className="flex items-baseline gap-1.5">
          <span className="text-lobby text-ink">{degrees(day.tMax)}</span>
          <span className="text-cell-sm text-faint">/ {degrees(day.tMin)}</span>
        </p>
        <div className="ml-auto flex flex-col gap-1 text-hint font-bold text-muted">
          {rain && (
            <span className="flex items-center gap-1.5">
              <Droplet aria-hidden="true" className="size-3.75" strokeWidth={2.2} /> {rain}
            </span>
          )}
          {day.windMax != null && (
            <span className="flex items-center gap-1.5">
              <Wind aria-hidden="true" className="size-3.75" strokeWidth={2.2} /> {t("{n} km/h", { n: day.windMax })}
            </span>
          )}
        </div>
      </div>

      {/* к выходу: время, погода в этот час и что надеть */}
      {leave && (
        <Liquid as="section" refract press={false} className="flex flex-col gap-3 rounded-card bg-card p-3.5">
          <p className="flex items-center gap-2">
            <DoorOpen aria-hidden="true" className="size-4.5 text-accent-ink" strokeWidth={2} />
            <span className="text-row font-extrabold text-ink">{t("Losgehen {time}", { time: leave })}</span>
            {leaveInfo && (
              <span className="ml-auto text-label text-muted">
                <span className="font-extrabold text-ink">{leaveInfo.temp}</span>
                {leaveInfo.rain && ` · ${leaveInfo.rain}`}
              </span>
            )}
          </p>
          {tips.length > 0 && <TipChips tips={tips} />}
        </Liquid>
      )}

      {hours.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-hint font-extrabold text-faint">{t("Schultag")}</h3>
          <Liquid as="div" refract press={false} className="rounded-card bg-card p-1.5">
            <HourStrip hours={hours} nowHour={nowHour} />
          </Liquid>
        </section>
      )}

      <p className="text-caption text-faint">
        {stand && `${t("Stand {time}", { time: stand })} · `}
        {t("Wetterdaten: Open-Meteo")}
      </p>
    </Sheet>
  );
};

export default WeatherSheet;
