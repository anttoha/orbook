import { PROVIDER_LABEL } from "../../shared/utils/materials";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { TrashIcon } from "../ui/icons";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// «Der Ordner in Google Drive», «Die Datei in OneDrive» — що саме лишається недоторканим
const whatStays = (item) => translate("{v1} in {v2}", { v1: item.kind === "folder" ? "Der Ordner" : "Die Datei", v2: PROVIDER_LABEL[item.provider] ?? "Drive" });

// Питання перед видаленням (макет handy-06): зникає лише посилання, файл у Drive лишається
const DeleteMaterialDialog = ({ item, actions }) => {
  const t = useT();
  return (
  <ConfirmDialog
    open={actions.confirm}
    onClose={actions.closeConfirm}
    icon={
      <span className="grid size-11 place-items-center rounded-full bg-danger-tint">
        <TrashIcon className="size-5.5 text-danger" />
      </span>
    }
    title={t("Link löschen?")}
    text={t("„{title}“ verschwindet für die ganze Klasse. {2} bleibt unverändert.", { title: item.title, "2": whatStays(item) })}
  >
    <Button onClick={actions.closeConfirm}>{t("Abbrechen")}</Button>
    <Button variant="danger" disabled={actions.busy} onClick={actions.remove}>
      <TrashIcon className="size-4" /> {t("Löschen")}
    </Button>
  </ConfirmDialog>
);
};

export default DeleteMaterialDialog;
