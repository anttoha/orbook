import { useSheet } from "../../shared/hooks/useSheet";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useUserStore } from "../../shared/store/userStore";
import { groupMaterials } from "../../shared/utils/materials";
import MaterialMenu from "./MaterialMenu";
import MaterialRow from "./MaterialRow";

// Один рядок: на ПК — з меню правої кнопки, на телефоні — довге натискання відкриває шторку
const Row = ({ item, overrides, fresh, isDesktop, onActions }) =>
  isDesktop ? (
    <MaterialMenu item={item}>
      <MaterialRow item={item} overrides={overrides} fresh={fresh} />
    </MaterialMenu>
  ) : (
    <MaterialRow item={item} overrides={overrides} fresh={fresh} onActions={onActions} />
  );

// ─────────────────────────────────────────────────────────────
// Групи за предметами: «Mathe · 2», під ним рядки (макети handy-01, pc-01).
// На ПК — дві колонки; група не розривається між колонками.
// freshId — щойно збережене посилання (мітка «Neu»)
// ─────────────────────────────────────────────────────────────
const MaterialGroups = ({ items, freshId }) => {
  const { openSheet } = useSheet();
  const overrides = useUserStore((s) => s.colorOverrides);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const openActions = (item) => openSheet("material", { id: item.id });

  return (
    <div className="gap-4 lg:columns-2">
      {groupMaterials(items).map((group) => (
        <section key={group.code} className="mb-3.5 flex break-inside-avoid flex-col gap-2">
          <h2 className="mb-0.5 text-hint font-extrabold text-faint">
            {group.name} · {group.items.length}
          </h2>
          {group.items.map((item) => (
            <Row key={item.id} item={item} overrides={overrides} fresh={item.id === freshId} isDesktop={isDesktop} onActions={openActions} />
          ))}
        </section>
      ))}
    </div>
  );
};

export default MaterialGroups;
