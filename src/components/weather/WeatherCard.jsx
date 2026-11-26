import { ChevronRight } from "lucide-react";
import { useWeather } from "../../shared/hooks/useWeather";
import { useSheet } from "../../shared/hooks/useSheet";
import { useT } from "../../shared/hooks/useT";
import { dayOf, degrees, standLabel, summaryLine, weatherTips } from "../../shared/utils/weather";
import Liquid from "../ui/Liquid";
import TipChips from "./TipChips";
import WeatherIcon from "./WeatherIcon";

// ─────────────────────────────────────────────────────────────
// Карточка погоды в «Tag» (макет 50 handy-05): «17° / 9°», дождь и ветер, первый совет «что надеть».
// Нажатие — шторка «Wetter» (?sheet=wetter&datum=…). Нет прогноза на день — карточки нет.
// weather — можно передать готовый ответ (превью в админке, тогда без нажатия)
// ─────────────────────────────────────────────────────────────
const WeatherCard = ({ date, weather: given, onOpen }) => {
  const t = useT();
  const { openSheet } = useSheet();
  const own = useWeather();
  const weather = given ?? own.weather;
  const day = dayOf(weather, date);
  if (!day) return null;

  const tip = weatherTips(day)[0]; // в карточке — только главный совет
  const offline = !given && own.status === "offline" && own.savedAt; // без сети — «Stand gestern 21:30»
  const open = onOpen ?? (() => openSheet("wetter", { datum: date }));

  return (
    <Liquid as="button" type="button" onClick={open} className="flex w-full items-center gap-3 rounded-card bg-card py-3.5 pr-3 pl-3.5 text-left">
      <WeatherIcon code={day.code} className="size-8 shrink-0 text-ink" strokeWidth={1.8} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-cell-sm text-ink">{degrees(day.tMax)}</span>
          <span className="text-label font-bold text-faint">/ {degrees(day.tMin)}</span>
          <span className="ml-auto">
            {offline ? (
              <span className="text-caption font-bold text-faint">{t("Stand {time}", { time: standLabel(own.savedAt) })}</span>
            ) : (
              tip && <TipChips tips={[tip]} small />
            )}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-hint text-muted">{summaryLine(day)}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </Liquid>
  );
};

export default WeatherCard;
