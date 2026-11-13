import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import * as admin from "../../../shared/api/admin";
import { useAdminClasses } from "../../../shared/hooks/useAdminClasses";
import { schoolClassOptions, targetOf } from "../../../shared/utils/adminClasses";
import Field from "../../ui/Field";
import ListPicker from "../../ui/ListPicker";
import Select from "../../ui/Select";

// Классы из плана школы (GET /admin/schools/{id}/classes). null — ещё грузим или не получилось
function usePlanClasses(schoolId) {
  const [plan, setPlan] = useState({ schoolId: null, data: null });
  useEffect(() => {
    if (!schoolId) return undefined;
    let cancelled = false;
    admin
      .loadSchoolClasses(schoolId)
      .then((data) => !cancelled && setPlan({ schoolId, data }))
      .catch(() => !cancelled && setPlan({ schoolId, data: null })); // нет плана — только уже созданные классы
    return () => {
      cancelled = true;
    };
  }, [schoolId]);
  return plan.schoolId === schoolId ? plan.data : null;
}

// ─────────────────────────────────────────────────────────────
// Поля «Schule» и «Klasse» в форме нового кода (часть 29, макеты handy-14, handy-15, handy-18).
// Школа — список (только если школ несколько), класс — из плана школы, с поиском.
// Класса ещё нет на сервере — «8a ist neu – die Klasse entsteht mit diesem Code».
// value — targetOf(…) (shared/utils/adminClasses) или null (старый сервер без школ: полей нет), onChange(next)
// ─────────────────────────────────────────────────────────────
const SchoolClassField = ({ value, onChange, disabled, error }) => {
  const { schools } = useAdminClasses();
  const plan = usePlanClasses(value?.schoolId ?? null);
  if (!value || schools.length === 0) return null;

  const school = schools.find((item) => item.id === value.schoolId);
  const options = schoolClassOptions(school, plan);
  const items = options.map((option) => ({ value: option.value, code: option.value, title: `Klasse ${option.value}`, subtitle: option.isNew ? "neu" : null }));
  const pickSchool = (id) => !disabled && onChange(targetOf(Number(id), null));
  const pickClass = (name) => !disabled && onChange(targetOf(value.schoolId, options.find((option) => option.value === name)));

  return (
    <>
      {schools.length > 1 && (
        <Field label="Schule">
          <Select variant="field" label="Schule" disabled={disabled} value={value.schoolId} options={schools.map((item) => ({ value: item.id, label: item.name }))} onChange={pickSchool} />
        </Field>
      )}
      <Field label="Klasse" error={error}>
        <ListPicker id="code-class" label="Klasse" title="Klasse wählen" placeholder={plan?.needsTest ? "Zuerst Verbindung testen" : "Klasse wählen"} inline items={items} value={value.className} onChange={pickClass} error={Boolean(error)} />
        {value.isNew && (
          <p className="mt-2 flex items-center gap-2 rounded-field bg-tint px-3.5 py-2.5 text-label text-accent-ink">
            <Info className="size-4 shrink-0" /> {value.className} ist neu – die Klasse entsteht mit diesem Code.
          </p>
        )}
      </Field>
    </>
  );
};

export default SchoolClassField;
