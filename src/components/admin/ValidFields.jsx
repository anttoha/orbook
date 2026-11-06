import Field from "../ui/Field";
import Segmented from "../ui/Segmented";
import TextField from "../ui/TextField";
import { validChoices } from "../../shared/utils/admin";

// «Gültig bis»: 30 Tage · Schuljahresende · Datum (+ поле дати). «Immer» немає: безстрокових кодів не буває
const ValidFields = ({ choice, date, yearEnd, onChange, disabled, error }) => (
  <Field label="Gültig bis" error={error}>
    <Segmented label="Gültig bis" size="form" value={choice} options={validChoices(yearEnd)} onChange={(value) => !disabled && onChange({ choice: value, date })} />
    {choice === "date" && (
      <TextField id="code-valid-date" className="mt-3" label="Datum" type="date" value={date} disabled={disabled} onChange={(event) => onChange({ choice, date: event.target.value })} />
    )}
  </Field>
);

export default ValidFields;
