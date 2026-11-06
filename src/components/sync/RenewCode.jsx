import { useState } from "react";
import { toast } from "sonner";
import { useSyncStore } from "../../shared/store/syncStore";
import { syncErrorText } from "../../shared/utils/notes";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { RenewIcon } from "../ui/icons";

// «Neuen Code erzeugen»: нотатки переїжджають під новий код, старий блок на сервері видаляється.
// Старий код на інших пристроях після цього не працює — тому спершу питаємо
const RenewCode = () => {
  const renewCode = useSyncStore((s) => s.renewCode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const renew = async () => {
    setBusy(true);
    try {
      await renewCode();
      toast.success("Neuer Code erzeugt");
    } catch (error) {
      toast.error(syncErrorText(error)); // старий код лишається
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mt-1 flex-none">
        <RenewIcon className="size-4" /> Neuen Code erzeugen
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        icon={<RenewIcon className="size-6.5 text-accent-ink" />}
        title="Neuen Code erzeugen?"
        text="Der alte Code funktioniert danach nicht mehr. Auf deinen anderen Geräten musst du den neuen Code eingeben."
      >
        <Button onClick={() => setOpen(false)}>Abbrechen</Button>
        <Button variant="primary" onClick={renew} disabled={busy}>
          {busy ? "Wird erzeugt …" : "Erzeugen"}
        </Button>
      </ConfirmDialog>
    </>
  );
};

export default RenewCode;
