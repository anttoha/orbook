import { Check } from "lucide-react";
import { KIND_LABEL, MATERIAL_SITES, PROVIDER_LABEL, checkLink } from "../../shared/utils/materials";
import Badge from "../ui/Badge";

// ─────────────────────────────────────────────────────────────
// Під полем «Link» (макет handy-03):
//   ✓ Erkannt: Google Drive · Ordner      — посилання підходить
//   підказка, звідки взяти посилання        — поле ще порожнє
//   Erlaubt: [GOOGLE DRIVE] [ONEDRIVE]      — завжди: які сайти дозволені
// Помилку (червоний текст) показує саме поле — тут її немає.
// ─────────────────────────────────────────────────────────────
const LinkStatus = ({ url, hasError }) => {
  const link = checkLink(url);
  return (
    <div className="mt-1.5 flex flex-col gap-2">
      {!hasError && link.ok && (
        <p className="flex items-center gap-1.5 text-hint font-bold text-ok">
          <Check className="size-3.5" /> Erkannt: {PROVIDER_LABEL[link.provider]} · {KIND_LABEL[link.kind]}
        </p>
      )}
      {!hasError && !url.trim() && <p className="text-caption text-faint">Aus Google Drive oder OneDrive: „Teilen“ → „Link kopieren“.</p>}
      <p className="flex flex-wrap items-center gap-1.5 text-caption font-bold text-faint">
        Erlaubt:
        {MATERIAL_SITES.map((site) => (
          <Badge key={site.provider} variant="soft">
            {site.name}
          </Badge>
        ))}
      </p>
    </div>
  );
};

export default LinkStatus;
