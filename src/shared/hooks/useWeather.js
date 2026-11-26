import { useEffect } from "react";
import { useWeatherStore } from "../store/weatherStore";
import { dayOf } from "../utils/weather";

// Погода школы: { weather, status, savedAt }. weather — null, если погоды нет (выключена, нет места, ошибка)
export function useWeather() {
  const weather = useWeatherStore((s) => s.data);
  const status = useWeatherStore((s) => s.status);
  const savedAt = useWeatherStore((s) => s.savedAt);
  const ensure = useWeatherStore((s) => s.ensure);
  useEffect(() => {
    ensure(); // первый показ или прошло 15 минут
  }, [ensure]);
  return { weather, status, savedAt };
}

// Погода одного дня или null
export const useWeatherDay = (date) => dayOf(useWeather().weather, date);
