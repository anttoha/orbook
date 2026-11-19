import { useState } from "react";
import { countText } from "../../../shared/utils/examTypes";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Select from "../../ui/Select";
import { TrashIcon } from "../../ui/icons";
import { useT } from "../../../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// «„Abgabe“ löschen?» (макет 24 handy-12). Есть записи этого вида — они получают другой вид (replaceWith).
// row — удаляемый вид, others — оставшиеся (имена); onConfirm(replacement | null)
// ─────────────────────────────────────────────────────────────
const DeleteTypeDialog = ({ row, others, busy, onClose, onConfirm }) => {
  const t = useT();
  const [replacement, setReplacement] = useState(others[0] ?? "");
  const used = row?.count > 0;

  return (
    <ConfirmDialog
      open={Boolean(row)}
      onClose={onClose}
      title={row ? `„${row.name}“ löschen?` : ""}
      text={used ? `${countText(row.count)} ${row.count === 1 ? t("hat diese Art. Er bekommt dann:") : t("haben diese Art. Sie bekommen dann:")}` : t("Diese Art hat keine Einträge.")}
      body={
        <>
          {used && <Select label={t("Ersatz")} variant="field" value={replacement} options={others.map((name) => ({ value: name, label: name }))} onChange={setReplacement} />}
          <p className="text-caption text-faint">{t("Die Liste ändert sich für alle in der Klasse.")}</p>
        </>
      }
    >
      <Button onClick={onClose}>{t("Abbrechen")}</Button>
      <Button variant="danger" disabled={busy} onClick={() => onConfirm(used ? replacement : null)}>
        <TrashIcon className="size-4" /> {t("Löschen")}
      </Button>
    </ConfirmDialog>
  );
};

export default DeleteTypeDialog;
