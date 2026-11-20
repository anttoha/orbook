import { GripVertical, Lock, Minus, Pencil, Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Строка на странице «Untere Leiste» (макет handy-03): ручка, иконка в кружке, имя (и подпись), кнопка справа.
// handle — свойства ручки от dnd-kit (null — строку не тащат: «Mehr» с замком).
// action: "minus" — убрать в «Mehr», "plus" — поставить вниз (off — места нет, серый), "edit" — шторка группы
// ─────────────────────────────────────────────────────────────
const ACTIONS = {
  minus: { Icon: Minus, label: "{name} entfernen", look: "size-6 rounded-full bg-danger-tint text-danger" },
  plus: { Icon: Plus, label: "{name} nach unten", look: "size-7 rounded-full bg-accent text-on-accent" },
  off: { Icon: Plus, label: "{name} nach unten", look: "size-7 rounded-full bg-sand text-faint2" },
  edit: { Icon: Pencil, label: "{name} bearbeiten", look: "size-7 rounded-full bg-sand text-ink" },
};

const LeisteRow = ({ icon: Icon, label, sub, handle, locked = false, action, onAction, nested = false, dragging = false }) => {
  const t = useT();
  const a = ACTIONS[action];
  return (
    <div className={cn("flex h-14 items-center gap-3 bg-card", nested && "pl-6.5", dragging && "rounded-tile shadow-raise ring-2 ring-accent")}>
      {handle ? (
        <span {...handle} aria-label={t("{name} verschieben").replace("{name}", label)} className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-full text-faint2 hover:bg-sand active:cursor-grabbing">
          <GripVertical className="size-4" />
        </span>
      ) : (
        <span className="grid size-7 shrink-0 place-items-center text-faint2">{locked && <Lock className="size-4" />}</span>
      )}
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint">
        <Icon className="size-4.5 text-accent-ink" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-row text-ink", sub ? "font-extrabold" : "font-semibold")}>{label}</span>
        {sub && <span className="block truncate text-caption text-faint">{sub}</span>}
      </span>
      {a && (
        <button type="button" onClick={onAction} aria-label={t(a.label).replace("{name}", label)} className="grid size-8 shrink-0 place-items-center">
          <span className={cn("grid place-items-center", a.look)}>
            <a.Icon className="size-4" strokeWidth={2.6} />
          </span>
        </button>
      )}
    </div>
  );
};

export default LeisteRow;
