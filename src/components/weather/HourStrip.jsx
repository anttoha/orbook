import { cn } from "../../shared/utils/cn";
import { RAIN_HINT, degrees } from "../../shared/utils/weather";
import WeatherIcon from "./WeatherIcon";

// Часы школьного дня (макет 50 handy-06): «07», значок, «9°»; дождь от 30 % — синим под температурой.
// nowHour — текущий час (сегодня) подсвечен
const HourStrip = ({ hours, nowHour }) => (
  <ol className="grid auto-cols-fr grid-flow-col">
    {hours.map((h) => {
      const on = h.hour === nowHour;
      return (
        <li key={h.hour} className={cn("flex flex-col items-center gap-1 rounded-field py-2", on && "bg-tint")}>
          <span className={cn("text-small font-extrabold", on ? "text-accent-ink" : "text-faint")}>{String(h.hour).padStart(2, "0")}</span>
          <WeatherIcon code={h.code} className={cn("size-5", on ? "text-ink" : "text-muted")} strokeWidth={1.9} />
          <span className="text-label font-extrabold text-ink">{degrees(h.temp)}</span>
          {/* место под «60 %» есть всегда — столбики одной высоты */}
          <span className="h-3.5 text-axis font-extrabold text-rain">{h.rain != null && h.rain >= RAIN_HINT ? `${h.rain} %` : ""}</span>
        </li>
      );
    })}
  </ol>
);

export default HourStrip;
