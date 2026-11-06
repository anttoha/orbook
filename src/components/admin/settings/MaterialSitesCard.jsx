import { Info } from "lucide-react";
import { MATERIAL_SITES } from "../../../shared/utils/materials";
import Badge from "../../ui/Badge";
import OptionRow from "./OptionRow";
import SettingsCard from "./SettingsCard";

// ─────────────────────────────────────────────────────────────
// «Materialien»: які сайти дозволені для посилань (макети handy-12, pc-09).
// Поки лише показ — той самий список, що перевіряє сервер (docs/API.md «Materialien»).
// ─────────────────────────────────────────────────────────────
const MaterialSitesCard = ({ className }) => (
  <SettingsCard
    className={className}
    title={
      <span className="flex items-center gap-2">
        Materialien <Badge variant="changed">Neu</Badge>
      </span>
    }
  >
    <div className="divide-y divide-hair">
      {MATERIAL_SITES.map((site) => (
        <OptionRow key={site.provider} label={site.name} hint={site.hosts.join(" · ")}>
          <Badge variant="ok">Erlaubt</Badge>
        </OptionRow>
      ))}
      <p className="flex gap-2 py-3 text-caption text-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>Andere Seiten (Dropbox, YouTube …) werden abgelehnt. Die Liste sieht jeder unter „Neuer Link“.</span>
      </p>
    </div>
  </SettingsCard>
);

export default MaterialSitesCard;
