import { Check } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { ACCENTS } from "../../shared/utils/appearance";
import { cn } from "../../shared/utils/cn";
import SettingRow from "../more/SettingRow";
import ListCard from "../ui/ListCard";
import { ChoiceRow } from "./WidgetRows";

const APP = { value: "app", label: "Wie App" };
const DESIGNS = [APP, { value: "soft", label: "Soft" }, { value: "glas", label: "Glas" }, { value: "klar", label: "Klar" }];
const LOOKS = [APP, { value: "hell", label: "Hell" }, { value: "dunkel", label: "Dunkel" }];
const FONTS = [{ value: "s", label: "S" }, { value: "m", label: "M" }, { value: "l", label: "L" }];
const ACCENT_NAMES = { violett: "Violett", blau: "Blau", gruen: "Grün", orange: "Orange", pink: "Pink", grafit: "Grafit" };

// «Hintergrund»: насколько плотная карточка виджета, шаг 10 % (0 — только текст на обоях)
const AlphaRow = ({ value, onChange }) => {
  const t = useT();
  return (
    <SettingRow label="Hintergrund">
      <div className="flex w-52 items-center gap-3">
        <input
          id="widget-alpha"
          type="range"
          min="0"
          max="100"
          step="10"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={t("Hintergrund")}
          className="min-w-0 flex-1 accent-accent"
        />
        <span className="w-11 text-right text-label font-bold text-muted tabular-nums">{value} %</span>
      </div>
    </SettingRow>
  );
};

// «Akzent»: «Wie App» (пунктирный кружок) и шесть цветов. data-accent включает токены цвета только в кружке
const AccentRow = ({ value, onChange }) => {
  const t = useT();
  const ring = (on) => cn("grid size-10 place-items-center rounded-full", on && "ring-2 ring-accent ring-offset-2 ring-offset-card");
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Akzent")}</h2>
      <div role="radiogroup" aria-label={t("Akzent")} className="flex items-center justify-between rounded-card bg-card px-3 py-3">
        <button type="button" role="radio" aria-checked={value === "app"} aria-label={t("Wie App")} onClick={() => onChange("app")} className={ring(value === "app")}>
          <span className="grid size-8 place-items-center rounded-full border-2 border-dashed border-faint2 text-micro font-black text-muted">{t("App")}</span>
        </button>
        {ACCENTS.map((accent) => (
          <button key={accent} type="button" role="radio" aria-checked={value === accent} aria-label={t(ACCENT_NAMES[accent])} data-accent={accent} onClick={() => onChange(accent)} className={ring(value === accent)}>
            <span className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">{value === accent && <Check className="size-4" strokeWidth={3} />}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

// «Aussehen» виджета (макет 31d handy-12): Design, светлый/тёмный, шрифт, фон и акцент
const WidgetLook = ({ draft, change }) => (
  <>
    <ListCard title="Aussehen">
      <ChoiceRow label="Design" options={DESIGNS} value={draft.design} onChange={(design) => change({ design })} />
      <ChoiceRow label="Hell / Dunkel" options={LOOKS} value={draft.look} onChange={(look) => change({ look })} />
      <ChoiceRow label="Schrift" options={FONTS} value={draft.font} onChange={(font) => change({ font })} />
      <AlphaRow value={draft.alpha} onChange={(alpha) => change({ alpha })} />
    </ListCard>
    <AccentRow value={draft.accent} onChange={(accent) => change({ accent })} />
  </>
);

export default WidgetLook;
