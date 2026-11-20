import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { GROUP_ICONS, SECTIONS, sectionAvailable } from "../../shared/utils/navLayout";
import { cn } from "../../shared/utils/cn";
import { GROUP_ICON, SECTION_ICONS } from "../navbar/navIcons";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import LeisteRow from "./LeisteRow";

// ─────────────────────────────────────────────────────────────
// Шторка группы (макет handy-05): имя, значок, что внутри, «Gruppe auflösen».
// Всё меняется сразу (без «Speichern»), как остальные настройки Darstellung.
// «Gruppe auflösen» ничего не удаляет: разделы группы уходят в «Mehr» (на странице — тост с «Rückgängig»)
// ─────────────────────────────────────────────────────────────
const GroupSheet = ({ group, features, onClose, onChange, onRemoveItem, onDissolve }) => {
  const t = useT();
  const open = Boolean(group);
  const [draft, setDraft] = useState(null); // имя, пока печатают: пустое в настройки не пишем
  const items = group?.items.filter((key) => sectionAvailable(key, features)) ?? [];

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={t("Gruppe")} title={group ? t(group.name) : ""}>
      {group && (
        <div className="flex flex-col gap-5">
          <TextField
            id="gruppe-name"
            label={t("Name")}
            value={draft ?? group.name}
            maxLength={24}
            onChange={(e) => {
              setDraft(e.target.value);
              if (e.target.value.trim()) onChange({ name: e.target.value });
            }}
            onBlur={() => setDraft(null)}
          />
          <div>
            <h3 className="mb-2.5 text-hint font-extrabold text-faint">{t("Symbol")}</h3>
            <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label={t("Symbol")}>
              {GROUP_ICONS.map((name) => {
                const Icon = GROUP_ICON[name];
                const on = group.icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={name}
                    onClick={() => onChange({ icon: name })}
                    className={cn("grid aspect-square place-items-center rounded-tile border transition-colors", on ? "border-2 border-accent bg-tint text-accent-ink" : "border-rule bg-card text-muted")}
                  >
                    <Icon className="size-5.5" />
                  </button>
                );
              })}
            </div>
          </div>
          {items.length > 0 && (
            <div>
              <h3 className="mb-2.5 text-hint font-extrabold text-faint">{t("Drin")}</h3>
              <div className="divide-y divide-hair rounded-card bg-card px-3.5">
                {items.map((key) => (
                  <LeisteRow key={key} icon={SECTION_ICONS[key]} label={SECTIONS[key].label} action="minus" onAction={() => onRemoveItem(key)} />
                ))}
              </div>
            </div>
          )}
          <Button variant="danger" onClick={onDissolve} className="flex-none">
            <Trash2 className="size-4" />
            {t("Gruppe auflösen")}
          </Button>
        </div>
      )}
    </Sheet>
  );
};

export default GroupSheet;
