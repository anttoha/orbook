import { slotText } from "../../shared/utils/entries";
import AutoMoveNote from "./AutoMoveNote";
import { useT } from "../../shared/hooks/useT";

// В окне записи (макет 24 handy-09): «Verschoben von Mi 17.09., 3. Stunde — die Stunde fällt aus. Automatisch.»
// Без movedFrom — ничего
const MovedNote = ({ entry }) => {
  const t = useT();
  const from = entry?.movedFrom;
  if (!from?.date) return null;
  return <AutoMoveNote lead={t("Verschoben von {1}{2}", { "1": slotText(from.date, null), "2": from.lesson ? t(", {lesson}. Stunde", { lesson: from.lesson }) : "" })}>{t("— die Stunde fällt aus. Automatisch.")}</AutoMoveNote>;
};

export default MovedNote;
