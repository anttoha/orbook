import { Droplet } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useT } from "../../shared/hooks/useT";
import { useWeather } from "../../shared/hooks/useWeather";
import { useFuerDichStore } from "../../shared/store/fuerDichStore";
import { mineOnly } from "../../shared/utils/format";
import { dayOf, degrees, hourAt, leaveTime, rainFrom } from "../../shared/utils/weather";
import WeatherIcon from "../weather/WeatherIcon";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Wetter» (часть 50b, макет 50 handy-02 «Wetter · 1 × 1»): сегодня макс/мин,
// дождь «60 % ab 13 Uhr», «Losgehen 07:05 · 9°». Нажатие — шторка «Wetter» дня
// ─────────────────────────────────────────────────────────────
const WetterBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const { weather, status } = useWeather();
  const leaveMinutes = useFuerDichStore((s) => s.settings.leaveMinutes);
  const filter = useLessonFilter({ mine: true });
  const { day: plan } = useDay(today);
  const day = dayOf(weather, today);
  const leave = plan?.status === "ok" ? leaveTime(mineOnly(filter(plan.lessons)), leaveMinutes) : null;
  const leaveHour = hourAt(day, leave);

  const body = () => {
    if (!day) return status === "loading" || status === "idle" ? <BlockSkeleton /> : <BlockEmpty text={t("Keine Wetterdaten")} />;
    const rain = rainFrom(day);
    return (
      <>
        <p className="flex items-center gap-2">
          <WeatherIcon code={day.code} className="size-8 shrink-0 text-ink" strokeWidth={1.8} />
          <span className="text-stat text-ink">{degrees(day.tMax)}</span>
          <span className="text-label font-bold text-faint">/ {degrees(day.tMin)}</span>
        </p>
        {day.rainMax != null && (
          <p className="mt-auto flex items-center gap-1 truncate text-caption font-bold text-muted">
            <Droplet aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.2} />
            {[`${day.rainMax} %`, rain].filter(Boolean).join(" ")}
          </p>
        )}
        {leave && <p className="truncate text-caption text-faint">{[t("Losgehen {time}", { time: leave }), leaveHour && degrees(leaveHour.temp)].filter(Boolean).join(" · ")}</p>}
      </>
    );
  };

  // нажатие — шторка «Wetter» через адрес (?sheet=wetter&datum=…), как у карточки в «Tag»
  return (
    <BlockCard kind="wetter" title={t("Wetter")} to={day ? `?sheet=wetter&datum=${today}` : undefined} editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default WetterBlock;
