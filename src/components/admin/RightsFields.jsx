import { LockIcon } from "../ui/icons";
import Badge from "../ui/Badge";
import Checkbox from "../ui/Checkbox";
import Field from "../ui/Field";

// isNew — бейдж «NEU» (права частини 14), hint — сірий рядок під галочкою
const EDITOR_RIGHTS = [
  { key: "create", label: "Klausuren eintragen" },
  { key: "editOwn", label: "Eigene bearbeiten und löschen" },
  { key: "editAll", label: "Alle Klausuren bearbeiten" },
  { key: "homework", label: "Hausaufgaben eintragen", isNew: true },
  { key: "editTeacher", label: "Lehrer-Einträge ändern", isNew: true, hint: "nur wenn die Lehrkraft es beim Eintrag erlaubt" },
  { key: "materials", label: "Materialien teilen", isNew: true }, // частина 15
];
// Lehrer-Code: міняти й видаляти — завжди лише свої, тому тут лише такі галочки (макет handy-11)
const TEACHER_RIGHTS = [
  { key: "create", label: "Klausuren und Tests eintragen" },
  { key: "homework", label: "Hausaufgaben eintragen" },
  { key: "materials", label: "Materialien teilen", isNew: true, hint: "nur für die eigenen Fächer" },
];

const RightLabel = ({ right }) => (
  <span className="flex flex-col">
    <span className="flex items-center gap-2">
      {right.label}
      {right.isNew && <Badge variant="changed">Neu</Badge>}
    </span>
    {right.hint && <span className="text-caption text-faint">{right.hint}</span>}
  </span>
);

// Галочки «Rechte» (вікно нового коду і «Rechte ändern»). value — { create, editOwn, editAll, homework, editTeacher, materials }.
// kind = "teacher" — права Lehrer-Code
const RightsFields = ({ value, onChange, disabled, error, kind = "editor" }) => (
  <Field label="Rechte" error={error}>
    <div className="-my-1.5">
      {(kind === "teacher" ? TEACHER_RIGHTS : EDITOR_RIGHTS).map((right) => (
        <Checkbox key={right.key} label={<RightLabel right={right} />} checked={Boolean(value[right.key])} disabled={disabled} onChange={(checked) => onChange({ ...value, [right.key]: checked })} />
      ))}
      {kind === "teacher" && (
        <p className="flex h-11 items-center gap-3.5 pl-0.5 text-row text-muted">
          <LockIcon className="size-4" /> Ändern und löschen: nur eigene Einträge
        </p>
      )}
    </div>
  </Field>
);

export default RightsFields;
