import { ExternalLink } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import { materialMeta } from "../../shared/utils/materials";
import MaterialTile from "../materials/MaterialTile";
import Liquid from "../ui/Liquid";

// ─────────────────────────────────────────────────────────────
// В окне записи (макет 24 handy-09): «Was lernen, was mitbringen» и «Materialien».
// Пустое описание (null) и пустой список — блоков нет. Ссылка открывается в новой вкладке.
// ─────────────────────────────────────────────────────────────
const EntryExtras = ({ entry, detailsTitle = "Was lernen, was mitbringen" }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const materials = entry?.materials ?? [];

  return (
    <>
      {entry?.details && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-hint font-extrabold text-faint">{detailsTitle}</h3>
          <p className="rounded-card bg-card px-3.5 py-3 text-body whitespace-pre-wrap text-ink">{entry.details}</p>
        </section>
      )}
      {materials.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-hint font-extrabold text-faint">Materialien</h3>
          <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
            {materials.map((item) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                  {/* у ссылки в записи нет предмета: цвет — предмета записи */}
                  <MaterialTile item={{ ...item, subject: entry.subject }} overrides={overrides} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-bold text-ink">{item.title}</span>
                    <span className="mt-0.5 block truncate text-note text-faint">{materialMeta(item)}</span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-faint" aria-hidden="true" />
                </a>
              </li>
            ))}
          </Liquid>
        </section>
      )}
    </>
  );
};

export default EntryExtras;
