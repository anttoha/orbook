import { useNavigate } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { useTourStore } from "../../shared/store/tourStore";
import OrbitMark from "../ui/OrbitMark";
import { useEndTour } from "../../shared/hooks/useEndTour";

// ─────────────────────────────────────────────────────────────
// Приветствие перед туром (макет 52 handy-00): окно выпрыгивает, «орбита» один раз проворачивается.
// «Los geht's» — тур с первого шага на Start, «Später» — закрыть (повтор из Mehr)
// ─────────────────────────────────────────────────────────────
const TourWelcome = () => {
  const t = useT();
  const navigate = useNavigate();
  const end = useEndTour();
  const begin = () => {
    navigate("/start");
    useTourStore.getState().begin();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-overlay px-6 motion-safe:animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="tour-hello" className="flex w-full max-w-sm flex-col items-center rounded-panel bg-card px-5 pt-7.5 pb-4 text-center shadow-sheet motion-safe:animate-tour-pop">
        <span className="grid size-18 place-items-center rounded-card bg-tint">
          <OrbitMark className="size-13 motion-safe:animate-tour-spin" />
        </span>
        <h2 id="tour-hello" className="mt-5 text-logo text-ink">
          {t("Willkommen bei ORBook")}
        </h2>
        <p className="mt-1.5 text-body-sm text-muted">{t("Kurzer Rundgang?")}</p>
        <button type="button" onClick={begin} className="mt-6 h-12 w-full rounded-full bg-accent text-row font-bold text-on-accent transition-transform active:scale-[0.98]">
          {t("Los geht’s")}
        </button>
        <button type="button" onClick={end} className="mt-2 h-11 w-full rounded-full text-body-sm font-extrabold text-muted">
          {t("Später")}
        </button>
      </div>
    </div>
  );
};

export default TourWelcome;
