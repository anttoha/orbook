import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { useFuerDichStore } from "../../shared/store/fuerDichStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { mySubjects } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";
import { addItem, removeItem, renameItem } from "../../shared/utils/fuerDich";
import { fachDotClass } from "../../shared/utils/lessons";
import Liquid from "../ui/Liquid";
import MitnehmenSheet from "./MitnehmenSheet";

// Свои предметы (из «Meine Kurse») + те, где уже есть вещи; сначала с вещами, потом по алфавиту
function subjectList(mine, items, names) {
  const codes = [...new Set([...Object.keys(items), ...(mine ?? [])])];
  const name = (code) => names?.[code] ?? code;
  return codes
    .map((code) => ({ code, name: name(code), count: items[code]?.length ?? 0 }))
    .sort((a, b) => (b.count > 0) - (a.count > 0) || a.name.localeCompare(b.name, "de"));
}

const ADD = "inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-dashed border-hair px-3 text-body-sm font-extrabold text-accent-ink hover:bg-paper";

// ─────────────────────────────────────────────────────────────
// «Mitnehmen pro Fach» (макет 50 handy-14, справа на pc-03): карточка на каждый свой предмет,
// плашки вещей (нажатие — переименовать, × — убрать) и «+ Neu». Всё сохраняется сразу
// ─────────────────────────────────────────────────────────────
const MitnehmenList = () => {
  const t = useT();
  const items = useFuerDichStore((s) => s.settings.items);
  const setItems = useFuerDichStore((s) => s.setItems);
  const overrides = useUserStore((s) => s.colorOverrides);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const names = usePlanStore((s) => s.meta?.subjects);
  const [edit, setEdit] = useState(null); // { code, name, index, text }

  const subjects = subjectList(mySubjects(me, courses, picked, hiddenRequired), items, names);
  const save = (text) => {
    setItems(edit.index == null ? addItem(items, edit.code, text) : renameItem(items, edit.code, edit.index, text));
    setEdit(null);
  };

  return (
    <>
      <ul className="flex flex-col gap-3">
        {subjects.map(({ code, name, count }) => (
          <Liquid as="li" key={code} refract press={false} className="rounded-card bg-card px-3.5 py-3.5">
            <p className="mb-2.5 flex items-center gap-2.5 text-subhead text-ink">
              <span className={cn("size-2.5 shrink-0 rounded-full", fachDotClass(code, overrides))} />
              <span className="truncate">{name}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(items[code] ?? []).map((item, index) => (
                <span key={item} className="inline-flex h-9 max-w-full items-center rounded-full bg-sand text-body-sm font-extrabold text-ink">
                  <button type="button" onClick={() => setEdit({ code, name, index, text: item })} className="min-w-0 truncate py-1.5 pl-3.5 pr-1.5 text-left">
                    {t(item)}
                  </button>
                  <button type="button" onClick={() => setItems(removeItem(items, code, index))} aria-label={t("{name} entfernen", { name: t(item) })} className="grid size-8 shrink-0 place-items-center rounded-full text-faint hover:text-ink">
                    <X className="size-4" strokeWidth={2.2} />
                  </button>
                </span>
              ))}
              <button type="button" onClick={() => setEdit({ code, name, index: null, text: "" })} className={ADD}>
                <Plus aria-hidden="true" className="size-4" strokeWidth={2.4} />
                {count ? t("Neu") : t("Hinzufügen")}
              </button>
            </div>
          </Liquid>
        ))}
      </ul>
      <MitnehmenSheet edit={edit} taken={edit ? (items[edit.code] ?? []) : []} onSave={save} onClose={() => setEdit(null)} />
    </>
  );
};

export default MitnehmenList;
