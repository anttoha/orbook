import { useT } from "../../shared/hooks/useT";
import Sheet from "../ui/Sheet";
import AddBlockList from "./AddBlockList";

// Шторка «Block hinzufügen» (макет handy-04): список всех блоков на белой карточке
const AddBlockSheet = ({ open, onClose, blocks, onAdd }) => {
  const t = useT();
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={t("Start")} title={t("Block hinzufügen")}>
      <div className="rounded-card bg-card px-3.5 py-0.5">
        <AddBlockList blocks={blocks} onAdd={onAdd} />
      </div>
    </Sheet>
  );
};

export default AddBlockSheet;
