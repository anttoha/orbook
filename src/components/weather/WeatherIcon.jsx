import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from "lucide-react";
import { weatherKind } from "../../shared/utils/weather";

// Вид погоды (из weatherKind) → контурная иконка lucide, как в макетах 50
const ICONS = { sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, fog: CloudFog, rain: CloudRain, snow: CloudSnow, storm: CloudLightning };

// Значок погоды по коду WMO. Нет кода — ничего
const WeatherIcon = ({ code, className, strokeWidth = 2 }) => {
  const Icon = ICONS[weatherKind(code)];
  return Icon ? <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} /> : null;
};

export default WeatherIcon;
