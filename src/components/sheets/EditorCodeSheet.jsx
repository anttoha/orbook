import { useEditorUnlock } from "../../shared/hooks/useEditorUnlock";
import { EditorCodeField, EditorCodeNote } from "../exams/EditorCodeField";
import { KeyIcon } from "../ui/icons";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Вікно коду поверх форми запису: сервер сказав, що коду немає або він застарів.
// Сторінка тут не годиться: учень втратив би заповнену форму.
// ─────────────────────────────────────────────────────────────
const EditorCodeSheet = ({ open, onClose }) => {
  const { code, setCode, error, busy, submit } = useEditorUnlock(onClose);

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" title="Editor-Code eingeben">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-row text-muted">Tests für die ganze Klasse eintragen darf nur, wer einen Editor-Code vom Admin hat.</p>
        <EditorCodeField code={code} onChange={setCode} error={error} />
        <EditorCodeNote />
        <div className="flex gap-2">
          <Button onClick={onClose}>Abbrechen</Button>
          <Button variant="primary" type="submit" disabled={busy}>
            <KeyIcon className="size-4" /> Freischalten
          </Button>
        </div>
      </form>
    </Sheet>
  );
};

export default EditorCodeSheet;
