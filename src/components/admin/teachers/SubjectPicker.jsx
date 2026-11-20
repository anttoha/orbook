import { useState } from "react";
import { Plus } from "lucide-react";
import ChipButton from "../../ui/ChipButton";
import { useUserStore } from "../../../shared/store/userStore";
import { cn } from "../../../shared/utils/cn";
import { fachClasses, fachDotClass } from "../../../shared/utils/lessons";
import { subjectChoices } from "../../../shared/utils/teachers";
import { useT } from "../../../shared/hooks/useT";

const chip = "flex h-9.5 items-center gap-2 rounded-full border-2 px-3.5 text-label font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// Fächer wählen (Entwurf 34 handy-02): Punkt + Name, gewählt = Fachfarbe. «Anderes Fach» öffnet ein kleines Feld.
// classSubjects: [{ code, name }] — Fächer der Klasse; selected: gewählte Codes
const SubjectPicker = ({ classSubjects, selected, onChange }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const nameOf = (code) => classSubjects.find((subject) => subject.code === code)?.name || code;
  const codes = subjectChoices(
    classSubjects.map((subject) => subject.code),
    selected,
  );
  const toggle = (code) => onChange(selected.includes(code) ? selected.filter((item) => item !== code) : [...selected, code]);
  const addOwn = () => {
    const code = draft.trim();
    if (code && !selected.includes(code)) onChange([...selected, code]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const on = selected.includes(code);
        return (
          <ChipButton key={code} aria-pressed={on} on={on} onClick={() => toggle(code)} look={cn(chip, on ? cn(fachClasses(code, overrides), "border-current") : "border-rule text-ink")}>
            <span className={cn("size-2 rounded-full", fachDotClass(code, overrides))} />
            {nameOf(code)}
          </ChipButton>
        );
      })}
      {adding ? (
        <input
          autoFocus
          aria-label={t("Anderes Fach")}
          value={draft}
          maxLength={40}
          placeholder={t("Kürzel des Fachs")}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={addOwn}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOwn();
            }
          }}
          className="h-9.5 w-36 rounded-full border-2 border-rule bg-card px-3.5 text-label text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      ) : (
        <ChipButton on={false} onClick={() => setAdding(true)} look={cn(chip, "border-dashed border-faint2 text-muted")}>
          <Plus className="size-4" /> {t("Anderes Fach")}
        </ChipButton>
      )}
    </div>
  );
};

export default SubjectPicker;
