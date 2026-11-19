import { useT } from "../../shared/hooks/useT";
import { blockInfo } from "../../shared/utils/startBlocks";
import { WIDGET_KINDS } from "../../shared/utils/widgetSnapshot";
import { BLOCK_ICONS } from "../start/blockIcons";
import ListCard from "../ui/ListCard";
import { CheckIcon } from "../ui/icons";

// Кружок выбора справа: выбранный — залитый акцентом с галочкой (макет 31 handy-04)
const RadioMark = ({ on }) =>
  on ? (
    <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
      <CheckIcon className="size-3.5" />
    </span>
  ) : (
    <span className="size-5 shrink-0 rounded-full border-2 border-faint2" />
  );

// «Inhalt»: что показывает виджет — один из девяти видов, как блоки Start
const WidgetKindList = ({ value, onChange }) => {
  const t = useT();
  return (
    <ListCard title={t("Inhalt")}>
    {WIDGET_KINDS.map(({ kind, hint }) => {
        const Icon = BLOCK_ICONS[kind];
        const on = kind === value;
        return (
          <li key={kind} className="flex">
            <button type="button" aria-pressed={on} onClick={() => onChange(kind)} className="-mx-1 flex h-14.5 min-w-0 flex-1 items-center gap-3 px-1 text-left">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-row font-bold text-ink">{t(blockInfo(kind)?.label)}</span>
                <span className="block truncate text-caption text-faint">{t(hint)}</span>
              </span>
              <RadioMark on={on} />
            </button>
          </li>
        );
      })}
    </ListCard>
  );
};

export default WidgetKindList;
