import Checkbox from "../ui/Checkbox";
import Field from "../ui/Field";

const RIGHTS = [
  { key: "create", label: "Klausuren eintragen" },
  { key: "editOwn", label: "Eigene bearbeiten und löschen" },
  { key: "editAll", label: "Alle Klausuren bearbeiten" },
];

// Три галочки «Rechte» (вікно нового коду і «Rechte ändern»). value — { create, editOwn, editAll }
const RightsFields = ({ value, onChange, disabled, error }) => (
  <Field label="Rechte" error={error}>
    <div className="-my-1.5">
      {RIGHTS.map((right) => (
        <Checkbox key={right.key} label={right.label} checked={value[right.key]} disabled={disabled} onChange={(checked) => onChange({ ...value, [right.key]: checked })} />
      ))}
    </div>
  </Field>
);

export default RightsFields;
