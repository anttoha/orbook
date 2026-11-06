import { ChevronRight, Copy, ExternalLink, Link2, Pencil, Share } from "lucide-react";
import { useSheet } from "../../shared/hooks/useSheet";
import { useMaterialActions } from "../../shared/hooks/useMaterialActions";
import { useMaterials } from "../../shared/store/materialsStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { KIND_LABEL, PROVIDER_LABEL, addedText, shortUrl } from "../../shared/utils/materials";
import DeleteMaterialDialog from "../materials/DeleteMaterialDialog";
import MaterialTile from "../materials/MaterialTile";
import { TrashIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";

// Рядок дії, як у «Code-Aktionen» (макет 43): іконка, текст, підпис праворуч, стрілка
const ActionRow = ({ icon: Icon, label, value, danger = false, onClick }) => (
  <li className="-mx-2">
    <button type="button" onClick={onClick} className="flex h-12.5 w-full items-center gap-3.25 rounded-field px-2 text-left outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-accent/50">
      <Icon className={cn("size-4.5 shrink-0", danger ? "text-danger" : "text-muted")} />
      <span className={cn("min-w-0 flex-1 truncate text-row font-medium", danger ? "text-danger" : "text-ink")}>{label}</span>
      {value && <span className="truncate text-label text-faint">{value}</span>}
      {!danger && <ChevronRight className="size-4 shrink-0 text-faint2" />}
    </button>
  </li>
);

// Вміст шторки: усі дії з посиланням (макет handy-02)
const MaterialActions = ({ item, onClose }) => {
  const actions = useMaterialActions(item, { onDone: onClose });
  const provider = PROVIDER_LABEL[item.provider] ?? "Drive";
  return (
    <>
      <p className="flex items-center gap-1.5 text-label text-muted">
        <Link2 className="size-3.5 shrink-0 text-faint" />
        <span className="truncate">{shortUrl(item.url)}</span>
      </p>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-0.5">
        <ActionRow icon={ExternalLink} label="Öffnen" value={`in ${provider}`} onClick={actions.open} />
        <ActionRow icon={Copy} label="Link kopieren" onClick={actions.copy} />
        <ActionRow icon={Share} label="Teilen" onClick={actions.share} />
        {item.canEdit && <ActionRow icon={Pencil} label="Bearbeiten" onClick={actions.edit} />}
        {item.canDelete && <ActionRow icon={TrashIcon} label="Löschen" danger onClick={actions.askDelete} />}
      </ul>
      <p className="text-caption text-faint">{addedText(item)}</p>
      <DeleteMaterialDialog item={item} actions={actions} />
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Шторка посилання: ?sheet=material&id=3 (довге натискання на рядок, телефон).
// Своїх запитів немає — посилання береться з уже завантаженого списку.
// ─────────────────────────────────────────────────────────────
const MaterialSheet = ({ open, onClose, sheet }) => {
  const { closeSheet } = useSheet();
  const overrides = useUserStore((s) => s.colorOverrides);
  const item = useMaterials((s) => s.items.find((material) => String(material.id) === sheet.id));
  if (!item) return null; // список ще вантажиться або посилання вже видалили

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={[subjectName(item.subject), PROVIDER_LABEL[item.provider], KIND_LABEL[item.kind] ?? KIND_LABEL.file].filter(Boolean).join(" · ")}
      title={item.title}
      icon={<MaterialTile item={item} overrides={overrides} size="lg" />}
    >
      <MaterialActions item={item} onClose={closeSheet} />
    </Sheet>
  );
};

export default MaterialSheet;
