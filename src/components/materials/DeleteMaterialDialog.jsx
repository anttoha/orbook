import { PROVIDER_LABEL } from "../../shared/utils/materials";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { TrashIcon } from "../ui/icons";

// «Der Ordner in Google Drive», «Die Datei in OneDrive» — що саме лишається недоторканим
const whatStays = (item) => `${item.kind === "folder" ? "Der Ordner" : "Die Datei"} in ${PROVIDER_LABEL[item.provider] ?? "Drive"}`;

// Питання перед видаленням (макет handy-06): зникає лише посилання, файл у Drive лишається
const DeleteMaterialDialog = ({ item, actions }) => (
  <ConfirmDialog
    open={actions.confirm}
    onClose={actions.closeConfirm}
    icon={
      <span className="grid size-11 place-items-center rounded-full bg-danger-tint">
        <TrashIcon className="size-5.5 text-danger" />
      </span>
    }
    title="Link löschen?"
    text={`„${item.title}“ verschwindet für die ganze Klasse. ${whatStays(item)} bleibt unverändert.`}
  >
    <Button onClick={actions.closeConfirm}>Abbrechen</Button>
    <Button variant="danger" disabled={actions.busy} onClick={actions.remove}>
      <TrashIcon className="size-4" /> Löschen
    </Button>
  </ConfirmDialog>
);

export default DeleteMaterialDialog;
