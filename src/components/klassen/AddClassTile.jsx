import { Plus } from "lucide-react";
import { useSheet } from "../../shared/hooks/useSheet";
import { useT } from "../../shared/hooks/useT";

// Пунктирная карточка «Klasse hinzufügen» под классами (телефон)
const AddClassTile = () => {
  const t = useT();
  const { openSheet } = useSheet();
  return (
    <button type="button" onClick={() => openSheet("klasseneu")} className="flex w-full items-center gap-3.5 rounded-card border-2 border-dashed border-hair px-4 py-3.5 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
        <Plus className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-row font-extrabold text-ink">{t("Klasse hinzufügen")}</span>
        <span className="block truncate text-label text-faint">{t("Mit Zugangscode, QR oder Einladungslink")}</span>
      </span>
    </button>
  );
};

export default AddClassTile;
