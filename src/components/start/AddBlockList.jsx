import { Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { BLOCKS, isBlockEnabled } from "../../shared/utils/startBlocks";
import { CheckIcon } from "../ui/icons";
import { BLOCK_ICONS } from "./blockIcons";

// ─────────────────────────────────────────────────────────────
// Все блоки списком (макеты handy-04 и pc-02 «Blöcke»): галочка — уже на Start, «+» — добавить.
// Блоки разделов, которые школа выключила, не предлагаются
// ─────────────────────────────────────────────────────────────
const AddBlockList = ({ blocks, onAdd }) => {
  const t = useT();
  const features = usePlanStore((s) => s.me?.features);
  const onStart = new Set(blocks.map((b) => b.kind));

  return (
    <ul className="divide-y divide-hair">
      {BLOCKS.filter((info) => isBlockEnabled(info, features)).map((info) => {
        const Icon = BLOCK_ICONS[info.kind];
        const added = onStart.has(info.kind);
        return (
          <li key={info.kind} className="flex items-center gap-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
              <Icon className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-row font-bold text-ink">{t(info.label)}</span>
              <span className="block truncate text-caption text-faint">{t(info.hint)}</span>
            </span>
            {added ? (
              <span className="mr-1.5 shrink-0 text-ok">
                <CheckIcon className="size-5" strokeWidth={2.6} />
                <span className="sr-only">{t("Auf Start")}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(info.kind)}
                aria-label={t("{name} hinzufügen").replace("{name}", t(info.label))}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform active:scale-95"
              >
                <Plus className="size-4.5" strokeWidth={2.6} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default AddBlockList;
