import { useNotenZiel } from "../../shared/hooks/useNotenZiel";
import { useT } from "../../shared/hooks/useT";
import { noteNumber } from "../../shared/utils/noten";
import { ALL } from "../../shared/utils/notenZiel";
import Sheet from "../ui/Sheet";
import ZielForm from "./ZielForm";

// Шторка «Mein Ziel» (на ПК — окно). subject = null — цель общего Schnitt
const ZielSheet = ({ open, onClose, half, subject, average }) => {
  const t = useT();
  const { goal, save } = useNotenZiel(half, subject?.code ?? ALL);
  const name = subject?.name ?? t("Schnitt");
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={`${name} · ${t("jetzt")} ${noteNumber(average)}`} title={t("Mein Ziel")}>
      {open && (
        <ZielForm
          key={`${half}-${subject?.code ?? ALL}`}
          subject={subject}
          average={average}
          goal={goal}
          onSave={(next) => {
            save(next);
            onClose();
          }}
        />
      )}
    </Sheet>
  );
};

export default ZielSheet;
