import { cn } from "../../shared/utils/cn";
import { useWeatherDay } from "../../shared/hooks/useWeather";
import { degrees } from "../../shared/utils/weather";
import WeatherIcon from "./WeatherIcon";

// Третья строка плашки дня в «Woche»: значок + максимум «17°» (часть 50a).
// Нет прогноза на день — пусто, но место остаётся (высота плашки та же)
const WeatherMini = ({ date, className, iconClassName }) => {
  const day = useWeatherDay(date);
  return (
    <span className={cn("flex items-center gap-1 whitespace-nowrap", className)}>
      {day && (
        <>
          <WeatherIcon code={day.code} className={cn("size-3 shrink-0", iconClassName)} strokeWidth={2.2} />
          <span>{degrees(day.tMax)}</span>
        </>
      )}
    </span>
  );
};

export default WeatherMini;
