import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { noteNumber } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";
import SchnittChart from "./SchnittChart";

// ─────────────────────────────────────────────────────────────
// Карточка «Schnitt» с графиком (часть 42): предмет — цветом предмета, общий Schnitt — фиолетовая.
// SCHNITT 2,1 · справа «Ziel 2,0» (или «Kein Ziel») и caption · ниже ход за полугодие.
// ─────────────────────────────────────────────────────────────
const SchnittCard = ({ average, ziel, caption, points, colorClass = "bg-tint text-accent-ink", wide }) => {
  const t = useT();
  return (
    <div className={cn("rounded-card px-4.5 pt-4.5 pb-4", colorClass)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-small font-extrabold tracking-wide uppercase">{t("Schnitt")}</p>
          <p className="mt-2 text-lobby">{noteNumber(average)}</p>
        </div>
        <div className="mb-2 min-w-0 text-right">
          <p className="text-lead font-extrabold">{ziel != null ? translate("Ziel {note}", { note: noteNumber(ziel) }) : t("Kein Ziel")}</p>
          {caption && <p className="truncate text-body-sm">{caption}</p>}
        </div>
      </div>
      <div className="mt-6">
        {points.length >= 2 ? (
          <SchnittChart points={points} ziel={ziel} wide={wide} />
        ) : (
          <p className="grid h-31 place-items-center border-b border-current/15 pb-2 text-row font-bold">{t("Verlauf ab 2 Noten")}</p>
        )}
      </div>
    </div>
  );
};

export default SchnittCard;
