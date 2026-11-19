import { Download, X } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useAndroidStore } from "../../shared/store/androidStore";
import OrbitMark from "../ui/OrbitMark";
import PillButton from "../ui/PillButton";
import RoundButton from "../ui/RoundButton";

// «ORBook für Android» вверху Mehr (макет 31 handy-06): рисуем, когда useAndroidCard() сказал «да»
const AndroidCard = () => {
  const t = useT();
  const dismiss = useAndroidStore((s) => s.dismissCard);
  return (
    <section className="relative flex flex-col gap-3.5 rounded-card bg-tint p-3.5 animate-rise-in motion-reduce:animate-none">
      <div className="flex items-center gap-3 pr-8">
        <span className="grid size-11 shrink-0 place-items-center rounded-tile border border-rule bg-card">
          <OrbitMark className="size-8" />
        </span>
        <div className="min-w-0">
          <p className="text-row font-extrabold text-ink">{t("ORBook für Android")}</p>
          <p className="text-caption text-muted">{t("Mit Widget für den Startbildschirm.")}</p>
        </div>
      </div>
      <RoundButton onClick={dismiss} aria-label={t("Nicht mehr zeigen")} look="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-card text-muted">
        <X className="size-4" />
      </RoundButton>
      <PillButton to="/mehr/android" glass="filled" size="md" className="flex h-10 items-center justify-center gap-2 rounded-full bg-accent text-label font-extrabold text-on-accent transition-transform active:scale-95">
        <Download className="size-4" aria-hidden="true" /> {t("App laden")}
      </PillButton>
    </section>
  );
};

export default AndroidCard;
