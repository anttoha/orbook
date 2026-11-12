import { useState } from "react";
import { countText } from "../../../shared/utils/examTypes";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Select from "../../ui/Select";
import { TrashIcon } from "../../ui/icons";

// ─────────────────────────────────────────────────────────────
// «„Abgabe“ löschen?» (макет 24 handy-12). Есть записи этого вида — они получают другой вид (replaceWith).
// row — удаляемый вид, others — оставшиеся (имена); onConfirm(replacement | null)
// ─────────────────────────────────────────────────────────────
const DeleteTypeDialog = ({ row, others, busy, onClose, onConfirm }) => {
  const [replacement, setReplacement] = useState(others[0] ?? "");
  const used = row?.count > 0;

  return (
    <ConfirmDialog
      open={Boolean(row)}
      onClose={onClose}
      title={row ? `„${row.name}“ löschen?` : ""}
      text={used ? `${countText(row.count)} ${row.count === 1 ? "hat diese Art. Er bekommt dann:" : "haben diese Art. Sie bekommen dann:"}` : "Diese Art hat keine Einträge."}
      body={
        <>
          {used && <Select label="Ersatz" variant="field" value={replacement} options={others.map((name) => ({ value: name, label: name }))} onChange={setReplacement} />}
          <p className="text-caption text-faint">Die Liste ändert sich für alle in der Klasse.</p>
        </>
      }
    >
      <Button onClick={onClose}>Abbrechen</Button>
      <Button variant="danger" disabled={busy} onClick={() => onConfirm(used ? replacement : null)}>
        <TrashIcon className="size-4" /> Löschen
      </Button>
    </ConfirmDialog>
  );
};

export default DeleteTypeDialog;
