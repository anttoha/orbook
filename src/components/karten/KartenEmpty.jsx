import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { KartenIcon } from "../ui/icons";

// Пусто (макет 43 handy-13): «Noch keine Stapel» и кнопка
const KartenEmpty = () => {
  const t = useT();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center motion-safe:animate-rise-in">
      <span className="mb-3 grid size-16 place-items-center rounded-full bg-tint text-accent-ink">
        <KartenIcon className="size-7" />
      </span>
      <h2 className="text-state text-ink">{t("Noch keine Stapel")}</h2>
      <p className="text-body-sm text-muted">{t("Vokabeln, Begriffe, Jahreszahlen")}</p>
      <Link to="/karteikarten/neu" className="mt-4 flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-row font-bold text-on-accent transition-opacity active:opacity-80">
        <Plus className="size-4" strokeWidth={2.4} /> {t("Stapel anlegen")}
      </Link>
    </div>
  );
};

export default KartenEmpty;
