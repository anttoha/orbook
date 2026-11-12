import { useNow } from "../../shared/hooks/useNow";
import { currentMonday } from "../../shared/utils/lessons";
import { isIsoDate, mondayOf } from "../../shared/utils/format";
import PlanStatusBody from "../live/PlanStatusBody";
import Sheet from "../ui/Sheet";

// Шторка «Plan-Status» (часть 26). Адрес: ?sheet=status&datum=<понедельник>; без даты — эта неделя
const PlanStatusSheet = ({ open, onClose, sheet }) => {
  const { today } = useNow();
  const monday = isIsoDate(sheet.datum) ? mondayOf(sheet.datum) : currentMonday(today);
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" panelLabel="Stundenplan" eyebrow="Stundenplan" title="Plan-Status">
      <PlanStatusBody monday={monday} />
    </Sheet>
  );
};

export default PlanStatusSheet;
