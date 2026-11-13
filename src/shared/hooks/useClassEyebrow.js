import { useActiveClass, useClasses } from "../store/classesStore";
import { useT } from "./useT";

// Строка над заголовком страниц, которые у каждого класса свои (Meine Kurse, Mitteilungen, Editor-Code):
// классов несколько — «Klasse 8b», чтобы было видно, для какого класса настройка; один класс — как раньше
export function useClassEyebrow(fallback) {
  const t = useT();
  const several = useClasses((s) => s.list.length > 1);
  const active = useActiveClass();
  return several && active ? `${t("Klasse")} ${active.name}` : fallback;
}
