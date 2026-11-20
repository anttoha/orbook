import { useCallback } from "react";
import { toast } from "sonner";
import { translate } from "../i18n/translate";
import { useNotenStore } from "../store/notenStore";
import { waitMinutes } from "../utils/noten";

// Кнопка «обновить» на Noten: запрос к InfoPoint и тост, если сервер просит подождать (макет handy-08).
// Остальные ошибки показывает сам экран (плашка «nicht erreichbar», форма входа)
export function useNotenRefresh() {
  const refresh = useNotenStore((s) => s.refresh);
  return useCallback(async () => {
    const code = await refresh();
    const error = useNotenStore.getState().error;
    if (code === "too_often") toast(translate("Gerade geholt – wieder in {n} Min.", { n: waitMinutes(error?.retryAfter) }));
    if (code === "rate_limited") toast(translate("Gerade zu viele Anfragen – versuch es gleich nochmal"));
    if (code === "disabled") toast(translate("Noten sind für deine Klasse ausgeschaltet"));
  }, [refresh]);
}
