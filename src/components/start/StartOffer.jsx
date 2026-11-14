import { House, X } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";

// ─────────────────────────────────────────────────────────────
// Карточка «Mit Start öffnen?» над блоками (макет handy-15) — пока Start не стартовая страница
// и ученик ещё не ответил. «Ja» — открывать со Start, × — больше не спрашивать
// ─────────────────────────────────────────────────────────────
const StartOffer = () => {
  const t = useT();
  const answer = useUserStore((s) => s.answerStartOffer);
  const startView = useUserStore((s) => s.startView);
  return (
    <div className="flex items-center gap-3 rounded-card bg-tint py-3.5 pr-2 pl-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-accent-ink">
        <House className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-extrabold text-ink">{t("Mit Start öffnen?")}</p>
        <p className="truncate text-caption text-muted">{t(startView === "heute" ? "Statt Heute beim Öffnen der App" : "Statt Woche beim Öffnen der App")}</p>
      </div>
      <button type="button" onClick={() => answer(true)} className="h-9 shrink-0 rounded-full bg-accent px-5 text-body-sm font-extrabold text-on-accent transition-opacity active:opacity-80">
        {t("Ja")}
      </button>
      <button type="button" onClick={() => answer(false)} aria-label={t("Nicht mehr fragen")} className="grid size-8 shrink-0 place-items-center text-faint">
        <X className="size-4.5" />
      </button>
    </div>
  );
};

export default StartOffer;
