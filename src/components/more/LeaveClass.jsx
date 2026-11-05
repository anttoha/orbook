import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../shared/store/planStore";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { LeaveIcon } from "../ui/icons";

// Рядок «Klasse verlassen» і діалог підтвердження (макет 28).
// Вихід стирає кеш плану, нотатки й налаштування лишаються (docs/frontend/02-zugang.md).
const LeaveClass = () => {
  const navigate = useNavigate();
  const logout = usePlanStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const leave = async () => {
    setBusy(true);
    await logout(); // без мережі теж виходить: помилку ковтає сам store
    navigate("/", { replace: true }); // після нового входу — стартовий екран, а не «Mehr»
  };

  return (
    <li>
      <button type="button" onClick={() => setOpen(true)} className="flex h-12.5 w-full items-center gap-3.25 text-danger">
        <LeaveIcon className="size-4.5 shrink-0" />
        <span className="text-row font-medium">Klasse verlassen</span>
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        icon={<LeaveIcon className="size-6.5 text-danger" />}
        title="Klasse verlassen?"
        text="Du musst das Klassenpasswort erneut eingeben. Deine Notizen bleiben auf dem Gerät, solange du den Sync-Code hast."
      >
        <Button onClick={() => setOpen(false)}>Bleiben</Button>
        <Button variant="danger" onClick={leave} disabled={busy}>
          <LeaveIcon className="size-4" /> Verlassen
        </Button>
      </ConfirmDialog>
    </li>
  );
};

export default LeaveClass;
