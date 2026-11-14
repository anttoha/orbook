import { useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import DeleteMaterialDialog from "../components/materials/DeleteMaterialDialog";
import MaterialRow from "../components/materials/MaterialRow";
import { TrashIcon } from "../components/ui/icons";
import { deleteAdminMaterial, loadAdminMaterials } from "../shared/api/materials";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { groupMaterials } from "../shared/utils/materials";
import RoundButton from "../components/ui/RoundButton";

// Рядок адмінки: той самий рядок посилання + кошик праворуч і мітка коду («Code B»), хто додав
const AdminRow = ({ item, onDelete }) => (
  <div className="flex items-center gap-2">
    <div className="min-w-0 flex-1">
      <MaterialRow item={item} />
    </div>
    <RoundButton aria-label={`„${item.title}“ löschen`} onClick={() => onDelete(item)} look="grid size-10 shrink-0 place-items-center rounded-full bg-card text-danger outline-none hover:bg-danger-tint focus-visible:ring-2 focus-visible:ring-accent/50">
      <TrashIcon className="size-4.5" />
    </RoundButton>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Materialien» адмінки: усі посилання класу і видалення будь-якого (рішення власника 06.11.2026).
// Вигляд — як список учня (макети handy-01, pc-01), дія одна — «Löschen».
// ─────────────────────────────────────────────────────────────
const AdminMaterials = () => {
  const list = useAdminLoad("materials", () => loadAdminMaterials().then((data) => data.materials));
  const [pending, setPending] = useState(null); // посилання в питанні «Link löschen?»
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAdminMaterial(pending);
      toast("Link gelöscht");
      list.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const items = list.data ?? [];
  const renderList = () => {
    if (list.status === "loading") return <AdminSkeleton />;
    if (list.status === "error") return <AdminError error={list.error} onRetry={list.reload} />;
    if (!items.length) return <AdminEmpty text="Noch keine Materialien" />;
    return (
      <div className="gap-4 lg:columns-2">
        {groupMaterials(items).map((group) => (
          <section key={group.code} className="mb-3.5 flex break-inside-avoid flex-col gap-2">
            <h2 className="mb-0.5 text-hint font-extrabold text-faint">
              {group.name} · {group.items.length}
            </h2>
            {group.items.map((item) => (
              <AdminRow key={item.id} item={item} onDelete={setPending} />
            ))}
          </section>
        ))}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Materialien" backTo="/admin" />
      {renderList()}
      {pending && <DeleteMaterialDialog item={pending} actions={{ confirm: true, closeConfirm: () => setPending(null), remove, busy }} />}
    </section>
  );
};

export default AdminMaterials;
