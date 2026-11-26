import { Plus } from "lucide-react";
import { useState } from "react";
import { hintsFor } from "../../shared/constants/packHints";
import { useT } from "../../shared/hooks/useT";
import { ITEM_MAX } from "../../shared/utils/fuerDich";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";

// ─────────────────────────────────────────────────────────────
// Шторка «Mitnehmen» (макет 50 handy-15): своё поле — главное, пишешь любую вещь.
// «Oft gebraucht» — только быстрые подсказки. edit — { code, name, index, text } (index null — новая вещь)
// onSave(text) — сохранить; шторка закрывается сама
// ─────────────────────────────────────────────────────────────
const MitnehmenSheet = ({ edit, taken, onSave, onClose }) => {
  const t = useT();
  return (
    <Sheet open={Boolean(edit)} onClose={onClose} desktop="dialog" eyebrow={edit?.name} title={t("Mitnehmen")}>
      {/* key — новая форма на каждое открытие: поле начинается с текста этой вещи */}
      {edit && <ItemForm key={`${edit.code}-${edit.index}`} edit={edit} taken={taken} onSave={onSave} />}
    </Sheet>
  );
};

const ItemForm = ({ edit, taken, onSave }) => {
  const t = useT();
  const [text, setText] = useState(edit.index == null ? "" : t(edit.text));
  const isNew = edit.index == null;
  const hints = isNew ? hintsFor(edit.code, taken, t) : [];
  const submit = (event) => {
    event.preventDefault();
    if (text.trim()) onSave(text);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <TextField id="mitnehmen-text" label="" aria-label={t("Mitnehmen")} value={text} maxLength={ITEM_MAX} autoFocus onChange={(e) => setText(e.target.value)} />
      {hints.length > 0 && (
        <section>
          <h3 className="mb-2 text-hint font-extrabold text-faint">{t("Oft gebraucht")}</h3>
          <div className="flex flex-wrap gap-2">
            {hints.map((hint) => (
              <button key={hint} type="button" onClick={() => onSave(hint)} className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-dashed border-hair px-3 text-body-sm font-extrabold text-accent-ink hover:bg-paper">
                <Plus aria-hidden="true" className="size-4" strokeWidth={2.4} />
                {hint}
              </button>
            ))}
          </div>
        </section>
      )}
      <Button type="submit" disabled={!text.trim()}>
        {isNew && <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.4} />}
        {isNew ? t("Hinzufügen") : t("Speichern")}
      </Button>
    </form>
  );
};

export default MitnehmenSheet;
