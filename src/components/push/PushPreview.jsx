import OrbitMark from "../ui/OrbitMark";
import { useT } from "../../shared/hooks/useT";

// «So sieht es aus» (Soft 26): песочная карточка с примером уведомления.
// В Android-приложении (часть 31e) пример — напоминание перед уроком
const PushPreview = ({ app = false }) => {
  const t = useT();
  return (
  <section className="flex flex-col gap-2.5">
    <h2 className="text-hint font-extrabold text-faint">{t("So sieht es aus")}</h2>
    <div className="flex gap-3 rounded-card bg-sand px-3.5 py-3.5">
      <OrbitMark className="mt-0.5 size-7.5 shrink-0" />
      <div className="min-w-0 text-body-sm text-ink">
        <p className="font-bold">{t("ORBook · jetzt")}</p>
        <p>{app ? t("In 10 min: 3. Std Physik · Raum 301") : t("Morgen ist was anders · 4. Std Geschichte: Vertretung, Raum B12")}</p>
      </div>
    </div>
  </section>
);
};

export default PushPreview;
