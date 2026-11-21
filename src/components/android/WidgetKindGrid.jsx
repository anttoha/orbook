import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { WIDGET_KIND_LIST, isNotenKind } from "../../shared/utils/widgetConfig";
import { cn } from "../../shared/utils/cn";
import { widgetKindInfo } from "./widgetKindInfo";

// «Inhalt»: что показывает виджет — плитки по три в ряд со значком (макеты 31d handy-12, 39 handy-06).
// Выбранная — в цвете акцента. Школа выключила «Noten» — виды с оценками не предлагаем (выбранный остаётся)
const WidgetKindGrid = ({ value, onChange }) => {
  const t = useT();
  const notenOff = usePlanStore((s) => s.me?.features?.noten === false);
  const kinds = WIDGET_KIND_LIST.filter((kind) => kind === value || !(notenOff && isNotenKind(kind)));
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Inhalt")}</h2>
      <div role="radiogroup" aria-label={t("Inhalt")} className="grid grid-cols-3 gap-2">
        {kinds.map((kind) => {
          const { label, Icon } = widgetKindInfo(kind);
          const on = kind === value;
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(kind)}
              className={cn("flex h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-field border-2 px-1", on ? "border-accent bg-tint text-accent-ink" : "border-transparent bg-card text-muted")}
            >
              <Icon className="size-5" />
              <span className={cn("max-w-full truncate text-label", on ? "font-extrabold" : "font-bold text-ink")}>{t(label)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default WidgetKindGrid;
