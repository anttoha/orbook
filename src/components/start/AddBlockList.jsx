import { Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { BLOCKS, isBlockEnabled } from "../../shared/utils/startBlocks";
import { CheckIcon } from "../ui/icons";
import { BLOCK_ICONS } from "./blockIcons";

// Одна строка: иконка, название и что показывает, справа «+» или галочка
const BlockRow = ({ info, added, onAdd, t }) => {
  const Icon = BLOCK_ICONS[info.kind];
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", added ? "bg-sand text-faint" : "bg-tint text-accent-ink")}>
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-row font-bold", added ? "text-muted" : "text-ink")}>{t(info.label)}</span>
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
};

// ─────────────────────────────────────────────────────────────
// Все блоки (шторка «Block hinzufügen» и панель «Alle Blöcke» на ПК) двумя группами:
// сверху те, что можно добавить («+»), ниже — уже на Start (галочка).
// Блоки разделов, которые школа выключила, не предлагаются
// ─────────────────────────────────────────────────────────────
const AddBlockList = ({ blocks, onAdd }) => {
  const t = useT();
  const features = usePlanStore((s) => s.me?.features);
  const onStart = new Set(blocks.map((b) => b.kind));
  const all = BLOCKS.filter((info) => isBlockEnabled(info, features));
  const groups = [
    { title: "Hinzufügen", items: all.filter((info) => !onStart.has(info.kind)), added: false },
    { title: "Schon auf Start", items: all.filter((info) => onStart.has(info.kind)), added: true },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <section key={group.title}>
          <h3 className="pt-1 text-hint font-extrabold text-faint">
            {t(group.title)} · {group.items.length}
          </h3>
          <ul className="divide-y divide-hair">
            {group.items.map((info) => (
              <BlockRow key={info.kind} info={info} added={group.added} onAdd={onAdd} t={t} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default AddBlockList;
