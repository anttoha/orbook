import { useState } from "react";
import { toast } from "sonner";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { usePlanStore } from "../../shared/store/planStore";
import { useSyncStore } from "../../shared/store/syncStore";
import { syncErrorText } from "../../shared/utils/notes";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { TrashIcon } from "../ui/icons";

// «Meine Sync-Daten löschen» (Datenschutz, макет 27): DELETE /api/sync і забути код.
// Нотатки на цьому пристрої лишаються. Видно тільки після входу і коли код є.
const DeleteSyncNotes = () => {
  const code = useSyncStore((s) => s.code);
  const forget = useSyncStore((s) => s.forget);
  const loggedIn = usePlanStore((s) => Boolean(s.me));
  const allowed = useSyncAllowed();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!code || !loggedIn || !allowed) return null;

  const remove = async () => {
    setBusy(true);
    try {
      await forget();
      toast.success("Sync-Daten gelöscht");
    } catch (error) {
      toast.error(syncErrorText(error)); // наприклад, немає мережі: код лишається, можна повторити
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)} className="mt-6 w-full flex-none">
        <TrashIcon className="size-4" /> Meine Sync-Daten löschen
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        icon={<TrashIcon className="size-6.5 text-danger" />}
        title="Sync-Daten löschen?"
        text="Die verschlüsselten Daten werden vom Server gelöscht und der Code von diesem Gerät entfernt. Alles auf diesem Gerät bleibt."
      >
        <Button onClick={() => setOpen(false)}>Abbrechen</Button>
        <Button variant="danger" onClick={remove} disabled={busy}>
          <TrashIcon className="size-4" /> Löschen
        </Button>
      </ConfirmDialog>
    </>
  );
};

export default DeleteSyncNotes;
