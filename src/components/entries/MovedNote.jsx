import { slotText } from "../../shared/utils/entries";
import AutoMoveNote from "./AutoMoveNote";

// В окне записи (макет 24 handy-09): «Verschoben von Mi 17.09., 3. Stunde — die Stunde fällt aus. Automatisch.»
// Без movedFrom — ничего
const MovedNote = ({ entry }) => {
  const from = entry?.movedFrom;
  if (!from?.date) return null;
  return <AutoMoveNote lead={`Verschoben von ${slotText(from.date, null)}${from.lesson ? `, ${from.lesson}. Stunde` : ""}`}>— die Stunde fällt aus. Automatisch.</AutoMoveNote>;
};

export default MovedNote;
