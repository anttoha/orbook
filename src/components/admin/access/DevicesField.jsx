import { DEVICE_CHOICES, MAX_DEVICES } from "../../../shared/utils/accessCodes";
import Field from "../../ui/Field";
import Segmented from "../../ui/Segmented";
import TextField from "../../ui/TextField";

// «Geräte höchstens»: готові варіанти або «Andere» — тоді під перемикачем поле для свого числа (1–500).
// value = { choice, custom }; так само влаштовано «Datum» у «Gültig bis» Editor-Codes
const DevicesField = ({ value, onChange, hint, error, disabled }) => (
  <Field label="Geräte höchstens">
    <Segmented label="Geräte höchstens" size="form" options={DEVICE_CHOICES} value={value.choice} onChange={(choice) => !disabled && onChange({ ...value, choice })} />
    {value.choice === "custom" && (
      <TextField
        id="access-devices"
        className="mt-3"
        label="Anzahl Geräte"
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_DEVICES}
        placeholder="z. B. 5"
        value={value.custom}
        error={error}
        readOnly={disabled}
        onChange={(event) => onChange({ ...value, custom: event.target.value })}
      />
    )}
    {!error && <p className="mt-1.5 text-caption text-faint">{hint}</p>}
  </Field>
);

export default DevicesField;
