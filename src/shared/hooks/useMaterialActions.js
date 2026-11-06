import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteMaterial, recreateMaterial } from "../api/materials";
import { useMaterials } from "../store/materialsStore";
import { copyText, shareText } from "../utils/share";

// ─────────────────────────────────────────────────────────────
// Дії з посиланням — однакові для шторки (телефон) і меню правої кнопки (ПК):
// відкрити, скопіювати, поділитися, змінити, видалити (з питанням «Link löschen?»).
// confirm — чи відкрите питання; remove — видалити після «Löschen».
// ─────────────────────────────────────────────────────────────
export function useMaterialActions(item, { onDone } = {}) {
  const navigate = useNavigate();
  const reload = useMaterials((s) => s.load);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = () => window.open(item.url, "_blank", "noopener,noreferrer");
  const copy = () => copyText(item.url);
  const share = () => shareText(`${item.title}\n${item.url}`);
  const edit = () => navigate(`/materialien/${item.id}/bearbeiten`);

  const remove = async () => {
    setBusy(true);
    try {
      await deleteMaterial(item);
      setConfirm(false);
      onDone?.();
      reload();
      // на сервері посилання видалене остаточно — «Rückgängig» створює його знову
      toast("Link gelöscht", { duration: 8000, action: { label: "Rückgängig", onClick: () => recreateMaterial(item).then(reload, (error) => toast.error(error.message)) } });
    } catch (error) {
      setConfirm(false);
      toast.error(error.message); // 409: хтось змінив посилання; 403: немає права
      reload();
    } finally {
      setBusy(false);
    }
  };

  return { open, copy, share, edit, remove, busy, confirm, askDelete: () => setConfirm(true), closeConfirm: () => setConfirm(false) };
}
