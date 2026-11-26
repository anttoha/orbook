import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useClasses } from "../../shared/store/classesStore";
import { useKartenStore } from "../../shared/store/kartenStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { formSubjects } from "../../shared/utils/examRules";
import { DEFAULT_SIDES, NAME_MAX, SIDE_MAX, deckLimitError, examRef, upcomingExams, validateDeckName } from "../../shared/utils/karten";
import { shortDay } from "../../shared/utils/lernplan";
import { mySubjectCodes, subjectItems } from "../../shared/utils/picker";
import Button from "../ui/Button";
import ErrorText from "../ui/ErrorText";
import Field from "../ui/Field";
import { CheckIcon } from "../ui/icons";
import ListPicker from "../ui/ListPicker";
import Segmented from "../ui/Segmented";
import TextField from "../ui/TextField";
import ListInput from "./ListInput";

const MODES = [
  { value: "einzeln", get label() { return translate("Einzeln"); } },
  { value: "liste", get label() { return translate("Liste"); } },
];

// Тесты класса для поля «Für Test»: «Vokabeltest · Do 25.09.»
const examItems = (exams) => exams.map((exam) => ({ value: String(exam.id), code: exam.subject?.code ?? "?", title: exam.topic || exam.type, subtitle: `${exam.type} · ${shortDay(exam.date)}` }));

// ─────────────────────────────────────────────────────────────
// «Neuer Stapel» / «Stapel bearbeiten» (макет 43 handy-06): имя, предмет, названия сторон, тест;
// у новой — карточки «Einzeln» (после сохранения сразу шторка «Karte hinzufügen») или «Liste».
// deck — стопка для правки (или null). preset — { subject, exam } из шторки теста
// ─────────────────────────────────────────────────────────────
const DeckForm = ({ deck, preset = {} }) => {
  const t = useT();
  const navigate = useNavigate();
  const { today } = useNow();
  const cls = useClasses((s) => s.activeId);
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const exams = upcomingExams(usePlanStore((s) => s.exams), today);
  const picked = useUserStore((s) => s.picked);
  const [name, setName] = useState(deck?.name ?? "");
  const [subject, setSubject] = useState(deck?.subject ?? preset.subject ?? null);
  const [sides, setSides] = useState(deck?.sides ?? ["", ""]);
  const [examId, setExamId] = useState(deck?.exam?.id ?? preset.exam ?? null);
  const [mode, setMode] = useState("liste");
  const [list, setList] = useState({ text: "", cards: [], errors: [] });
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(null); // «Höchstens …» — стопка не сохранена
  const { addDeck, updateDeck } = useKartenStore.getState();

  const setSide = (i, value) => setSides(sides.map((old, j) => (i === j ? value : old)));
  const exam = exams.find((x) => String(x.id) === examId) ?? null;
  // Выбрали тест, а предмета ещё нет — берём предмет теста
  const pickExam = (value) => {
    setExamId(value);
    const next = exams.find((x) => String(x.id) === value);
    if (next?.subject?.code && !subject) setSubject(next.subject.code);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = validateDeckName(name);
    if (problem) return setError(problem);
    const fields = { name: name.trim(), subject, sides, exam: exam ? examRef(exam, cls) : examId ? deck?.exam ?? null : null };
    try {
      if (deck) {
        updateDeck(deck.id, fields);
        toast.success(translate("Stapel gespeichert"));
        return navigate(`/karteikarten/${deck.id}`, { replace: true });
      }
      const cards = mode === "liste" ? list.cards : [];
      const full = deckLimitError(useKartenStore.getState().decks, cards.length);
      if (full) return setLimit(full);
      const id = addDeck({ ...fields, cards });
      toast.success(translate("Stapel gespeichert"));
      navigate(mode === "einzeln" ? `/karteikarten/${id}?karte=neu` : `/karteikarten/${id}`, { replace: true });
    } catch {
      toast.error(translate("Stapel konnte nicht gespeichert werden")); // localStorage переполнен или запрещён
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
      <TextField
        id="stapel-name"
        label={t("Name")}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        placeholder={t("z. B. Unit 3 · Travel")}
        maxLength={NAME_MAX}
        error={error}
        autoFocus={!deck}
      />
      <Field label={t("Fach")}>
        <ListPicker id="stapel-fach" label={t("Fach")} clearable clearLabel={t("Ohne Fach")} items={subjectItems(formSubjects(courses, picked, metaSubjects, null), mySubjectCodes(courses, picked))} value={subject} onChange={setSubject} />
      </Field>
      <Field label={t("Seiten")}>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <TextField key={i} id={`stapel-seite-${i}`} label={i === 0 ? t("Vorderseite") : t("Rückseite")} className="[&>label]:sr-only" value={sides[i]} onChange={(e) => setSide(i, e.target.value)} placeholder={t(DEFAULT_SIDES[i])} maxLength={SIDE_MAX} />
          ))}
        </div>
      </Field>
      {(exams.length > 0 || examId) && (
        <Field label={t("Für Test")}>
          <ListPicker id="stapel-test" label={t("Für Test")} clearable clearLabel={t("Ohne Test")} title={t("Test wählen")} placeholder={t("Ohne Test")} items={examItems(exams)} value={examId} onChange={pickExam} />
        </Field>
      )}
      {!deck && (
        <Field label={t("Karten")}>
          <div className="flex flex-col gap-3">
            <Segmented
              options={MODES}
              value={mode}
              onChange={(value) => {
                setMode(value);
                setLimit(null);
              }}
              label={t("Karten")}
            />
            {mode === "liste" && (
              <ListInput
                value={list}
                onChange={(value) => {
                  setList(value);
                  setLimit(null);
                }}
              />
            )}
          </div>
        </Field>
      )}
      <ErrorText>{limit}</ErrorText>
      <Button type="submit" variant="primary" className="flex-none">
        <CheckIcon className="size-4" /> {t("Stapel speichern")}
      </Button>
    </form>
  );
};

export default DeckForm;
