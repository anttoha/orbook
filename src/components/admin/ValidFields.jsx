import Field from "../ui/Field";
import Segmented from "../ui/Segmented";
import TextField from "../ui/TextField";
import { validChoices } from "../../shared/utils/admin";
import { useT } from "../../shared/hooks/useT";

// «Gültig bis»: 30 Tage · Schuljahresende · Datum (+ поле дати). «Immer» немає: безстрокових кодів не буває
const ValidFields = ({ choice, date, yearEnd, onChange, disabled, error }) => {
  const t = useT();
  return (
  <Field label={t("Gültig bis")} error={error}>
    <Segmented label={t("Gültig bis")} size="form" value={choice} options={validChoices(yearEnd)} onChange={(value) => !disabled && onChange({ choice: value, date })} />
    {choice === "date" && (
      <TextField id="code-valid-date" className="mt-3" label={t("Datum")} type="date" value={date} disabled={disabled} onChange={(event) => onChange({ choice, date: event.target.value })} />
    )}
  </Field>
);
};

export default ValidFields;
