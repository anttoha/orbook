import { toast } from "sonner";
import { useTourStore } from "../store/tourStore";
import { useT } from "./useT";

// Rundgang (часть 52): конец тура — Fertig, Überspringen или Später. Закрыть и коротко сказать, где его найти снова
export const useEndTour = () => {
  const t = useT();
  return () => {
    useTourStore.getState().close();
    toast(t("Rundgang findest du in Mehr"));
  };
};
