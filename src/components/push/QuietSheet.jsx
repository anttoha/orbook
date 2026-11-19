import { useState } from "react";
import { toast } from "sonner";
import { pushErrorText, usePushStore } from "../../shared/store/pushStore";
import { CheckIcon } from "../ui/icons";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import { useT } from "../../shared/hooks/useT";

// Шторка «Ruhezeit» (макет 17 handy-06): с какого и до какого времени телефон молчит. Адрес: ?sheet=ruhezeit
const QuietSheet = ({ open, onClose }) => {
  const t = useT();
  const quiet = usePushStore((s) => s.quiet);
  const update = usePushStore((s) => s.update);
  const [draft, setDraft] = useState(quiet);
  const [busy, setBusy] = useState(false);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(quiet); // при каждом открытии — то, что сохранено
  }

  const save = async () => {
    setBusy(true);
    try {
      await update({ quiet: { on: true, start: draft.start || "21:00", end: draft.end || "06:30" } });
      onClose();
    } catch (error) {
      toast.error(pushErrorText(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={t("Mitteilungen")}
      title={t("Ruhezeit")}
      footer={
        <Button variant="primary" onClick={save} disabled={busy}>
          <CheckIcon className="size-4" /> {t("Fertig")}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-muted">{t("In dieser Zeit bleibt dein Handy still.")}</p>
        <div className="grid grid-cols-2 gap-3">
          <TextField id="ruhe-von" label={t("Von")} type="time" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          <TextField id="ruhe-bis" label={t("Bis")} type="time" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
        </div>
        <p className="rounded-field bg-sand px-3.25 py-3 text-label text-muted">
          {t("Fällt heute eine Stunde aus, kommt das nach der Ruhezeit – falls es dann noch stimmt.")}
        </p>
      </div>
    </Sheet>
  );
};

export default QuietSheet;
