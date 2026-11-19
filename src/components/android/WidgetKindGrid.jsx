import { useT } from "../../shared/hooks/useT";
import { blockInfo } from "../../shared/utils/startBlocks";
import { WIDGET_KIND_LIST } from "../../shared/utils/widgetConfig";
import { cn } from "../../shared/utils/cn";
import { BLOCK_ICONS } from "../start/blockIcons";

// «Inhalt»: что показывает виджет — плитки 3×3 со значком (макет 31d handy-12). Выбранная — в цвете акцента
const WidgetKindGrid = ({ value, onChange }) => {
  const t = useT();
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Inhalt")}</h2>
      <div role="radiogroup" aria-label={t("Inhalt")} className="grid grid-cols-3 gap-2">
        {WIDGET_KIND_LIST.map((kind) => {
          const Icon = BLOCK_ICONS[kind];
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
              <span className={cn("max-w-full truncate text-label", on ? "font-extrabold" : "font-bold text-ink")}>{t(blockInfo(kind)?.label)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default WidgetKindGrid;
