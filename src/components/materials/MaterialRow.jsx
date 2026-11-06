import { ExternalLink } from "lucide-react";
import { useLongPress } from "../../shared/hooks/useLongPress";
import { materialMeta } from "../../shared/utils/materials";
import Badge from "../ui/Badge";
import MaterialTile from "./MaterialTile";

// ─────────────────────────────────────────────────────────────
// Рядок посилання (макет handy-01):
//   [папка]  Arbeitsblätter Analysis                ↗
//            Google Drive · Ordner · von Mü
// Це справжнє посилання: натискання відкриває Drive у новій вкладці.
// onActions — довге натискання (телефон): шторка дій. На ПК рядок обгортає MaterialMenu (права кнопка).
// fresh — щойно збережене: мітка «Neu»
// ─────────────────────────────────────────────────────────────
const MaterialRow = ({ item, overrides, fresh, onActions, ref, ...menuProps }) => {
  const press = useLongPress(() => onActions?.(item));
  return (
    <a
      ref={ref}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      {...(onActions ? press : {})}
      {...menuProps}
      className="flex min-h-16 w-full items-center gap-3 rounded-card bg-card px-3 py-3 text-left outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-accent/50 data-[state=open]:ring-1 data-[state=open]:ring-accent"
    >
      <MaterialTile item={item} overrides={overrides} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{item.title}</span>
        <span className="mt-1 block truncate text-note text-faint">{materialMeta(item)}</span>
      </span>
      {fresh && <Badge variant="changed">Neu</Badge>}
      <ExternalLink className="size-4.5 shrink-0 text-faint" aria-hidden="true" />
    </a>
  );
};

export default MaterialRow;
