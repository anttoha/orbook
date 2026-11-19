import { LockIcon } from "../ui/icons";
import Badge from "../ui/Badge";
import Checkbox from "../ui/Checkbox";
import Field from "../ui/Field";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// Часть 29: «Klasse verwalten» — Zugangscodes и приглашения своего класса (у Editor- и Lehrer-Code, по умолчанию выкл.)
const MANAGE_CLASS = { key: "manageClass", get label() { return translate("Klasse verwalten"); }, isNew: true, get hint() { return translate("Zugangscodes und Einladungen dieser Klasse"); } };

// isNew — бейдж «NEU» (права частини 14), hint — сірий рядок під галочкою
const EDITOR_RIGHTS = [
  { key: "create", get label() { return translate("Tests eintragen"); } },
  { key: "editOwn", get label() { return translate("Eigene bearbeiten und löschen"); } },
  { key: "editAll", get label() { return translate("Alle Tests bearbeiten"); } },
  { key: "homework", get label() { return translate("Hausaufgaben eintragen"); }, isNew: true },
  { key: "editTeacher", get label() { return translate("Lehrer-Einträge ändern"); }, isNew: true, get hint() { return translate("nur wenn die Lehrkraft es beim Eintrag erlaubt"); } },
  { key: "materials", label: "Materialien teilen", isNew: true }, // частина 15
  { key: "appointments", get label() { return translate("Termine eintragen"); }, isNew: true, get hint() { return translate("Ausflüge, Elternabende, freie Tage"); } }, // частина 18
  MANAGE_CLASS,
];
// Lehrer-Code: міняти й видаляти — завжди лише свої, тому тут лише такі галочки (макет handy-11)
const TEACHER_RIGHTS = [
  { key: "create", get label() { return translate("Tests eintragen"); } },
  { key: "homework", get label() { return translate("Hausaufgaben eintragen"); } },
  { key: "materials", label: "Materialien teilen", isNew: true, get hint() { return translate("nur für die eigenen Fächer"); } },
  { key: "appointments", get label() { return translate("Termine eintragen"); }, isNew: true, get hint() { return translate("Kurs-Termine nur für die eigenen Fächer"); } },
  MANAGE_CLASS,
];

const RightLabel = ({ right }) => {
  const t = useT();
  return (
  <span className="flex flex-col">
    <span className="flex items-center gap-2">
      {right.label}
      {right.isNew && <Badge variant="changed">{t("Neu")}</Badge>}
    </span>
    {right.hint && <span className="text-caption text-faint">{right.hint}</span>}
  </span>
);
};

// Галочки «Rechte» (вікно нового коду і «Rechte ändern»). value — { create, editOwn, editAll, homework, editTeacher, materials }.
// kind = "teacher" — права Lehrer-Code
const RightsFields = ({ value, onChange, disabled, error, kind = "editor" }) => {
  const t = useT();
  return (
  <Field label={t("Rechte")} error={error}>
    <div className="-my-1.5">
      {(kind === "teacher" ? TEACHER_RIGHTS : EDITOR_RIGHTS).map((right) => (
        <Checkbox key={right.key} label={<RightLabel right={right} />} checked={Boolean(value[right.key])} disabled={disabled} onChange={(checked) => onChange({ ...value, [right.key]: checked })} />
      ))}
      {kind === "teacher" && (
        <p className="flex h-11 items-center gap-3.5 pl-0.5 text-row text-muted">
          <LockIcon className="size-4" /> {t("Ändern und löschen: nur eigene Einträge")}
        </p>
      )}
    </div>
  </Field>
);
};

export default RightsFields;
