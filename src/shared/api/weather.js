// ─────────────────────────────────────────────────────────────
// weather.js — погода места школы (часть 50a, /opt/orbook-be/docs/API.md «Wetter»).
// Сервер сам спрашивает Open-Meteo; устройство ходит только к нашему серверу.
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

// → { place, updatedAt, days } или null (204: погода выключена, места нет, данных нет).
// Без conditional: ответ маленький, а так 204 («погоды нет») не спутать с 304 («не изменилось»)
export const loadWeather = () => api("/weather");

// ── Админка ──
// До 5 мест: [{ name, region, country, lat, lon, timezone }]
export const searchPlaces = (q, signal) => api(`/admin/weather/places?q=${encodeURIComponent(q)}`, { signal }).then((r) => r?.places ?? []);
// Прогноз для ещё не сохранённого места («Vorschau · heute»)
export const previewWeather = (place, signal) => {
  const query = new URLSearchParams({ lat: place.lat, lon: place.lon, name: place.name, timezone: place.timezone ?? "Europe/Berlin" });
  return api(`/admin/weather/preview?${query}`, { signal });
};
