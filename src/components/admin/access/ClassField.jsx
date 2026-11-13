import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import * as admin from "../../../shared/api/admin";
import { adminClassItems } from "../../../shared/utils/classes";
import Field from "../../ui/Field";
import ListPicker from "../../ui/ListPicker";

// ─────────────────────────────────────────────────────────────
// Поле «Klasse» в форме нового Zugangscode (часть 29, макет handy-14):
// для какого класса код. Класс, которого на сервере ещё нет, появится вместе с этим кодом.
// value — "schoolId:имя" или null (класс по умолчанию — первый), onChange(item | null)
// ─────────────────────────────────────────────────────────────
const ClassField = ({ value, onChange, disabled }) => {
  const [items, setItems] = useState(null); // null — ещё грузим

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { schools } = await admin.loadSchools();
      const plan = {};
      await Promise.all(schools.map(async (school) => (plan[school.id] = await admin.loadSchoolClasses(school.id).catch(() => null))));
      const list = adminClassItems(schools, plan);
      if (cancelled) return;
      setItems(list);
      if (!value && list[0]) onChange(list.find((item) => !item.isNew) ?? list[0]); // по умолчанию — первый готовый класс
    })().catch(() => !cancelled && setItems([])); // старый сервер без школ — поля нет
    return () => {
      cancelled = true;
    };
    // список грузим один раз при открытии формы
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items || items.length === 0) return null;
  const picked = items.find((item) => item.value === value);
  return (
    <Field label="Klasse">
      <ListPicker id="access-class" label="Klasse" title="Klasse wählen" placeholder="Klasse wählen" inline items={items} value={value} onChange={(next) => !disabled && onChange(items.find((item) => item.value === next) ?? null)} />
      {picked?.isNew && (
        <p className="mt-2 flex items-center gap-2 rounded-field bg-tint px-3.5 py-2.5 text-label text-accent-ink">
          <Info className="size-4 shrink-0" /> {picked.className} ist neu – die Klasse entsteht mit diesem Code.
        </p>
      )}
    </Field>
  );
};

export default ClassField;
