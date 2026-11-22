import { useNotenZielStore } from "../store/notenZielStore";
import { zielKey } from "../utils/notenZiel";

// Сохранённая цель предмета (или общего Schnitt — code = ALL) в полугодии и функция «сохранить / убрать»
export function useNotenZiel(half, code) {
  const key = zielKey(half, code);
  const goal = useNotenZielStore((s) => s.ziele[key]);
  const setZiel = useNotenZielStore((s) => s.setZiel);
  return { goal, save: (next) => setZiel(key, next) };
}
