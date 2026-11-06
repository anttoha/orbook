import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { EditorCodeField, EditorCodeNote } from "../components/exams/EditorCodeField";
import Button from "../components/ui/Button";
import { KeyIcon, TrashIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { useEditorUnlock } from "../shared/hooks/useEditorUnlock";
import { usePlanStore } from "../shared/store/planStore";
import { fullDate } from "../shared/utils/examRules";

// Куди після коду (?weiter=…): лише наші адреси, не з параметра
const NEXT = { neu: "/testen/neu", hausaufgabe: "/testen/hausaufgaben/neu" };

// Коду ще немає: поле вводу. ?weiter=neu — після коду одразу до форми запису
const UnlockForm = ({ backTo }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = NEXT[params.get("weiter")] ?? backTo;
  const { code, setCode, error, busy, submit } = useEditorUnlock(() => navigate(next, { replace: true }));

  return (
    <form onSubmit={submit} className="mt-5 flex flex-1 flex-col gap-4.5">
      <p className="text-row text-muted">Mit einem Editor-Code kannst du Klausuren und Tests für die ganze Klasse eintragen. Den Code bekommst du vom Admin.</p>
      <EditorCodeField code={code} onChange={setCode} error={error} />
      <Button variant="primary" type="submit" disabled={busy} className="flex-none">
        <KeyIcon className="size-4" /> Freischalten
      </Button>
      <EditorCodeNote className="mt-auto" />
    </form>
  );
};

// Код уже є: що він дає і кнопка прибрати
const ActiveCode = ({ editor }) => {
  const lockEditor = usePlanStore((s) => s.lockEditor);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await lockEditor();
      toast("Code entfernt", { duration: 3000 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 flex flex-1 flex-col gap-4.5">
      <div className="rounded-card bg-card px-4 py-3.5">
        <p className="text-body font-bold text-ink">{editor.label}</p>
        {editor.validUntil && <p className="mt-0.5 text-hint text-muted">gültig bis {fullDate(editor.validUntil)}</p>}
      </div>
      <Button variant="danger" onClick={remove} disabled={busy} className="flex-none">
        <TrashIcon className="size-4" /> Code entfernen
      </Button>
      <EditorCodeNote className="mt-auto" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Сторінка Editor-Code. /editor-code
// POST /api/editor/unlock і /editor/lock, стан — me.editor.
// ─────────────────────────────────────────────────────────────
const EditorCode = () => {
  const editor = usePlanStore((s) => s.me?.editor);
  const location = useLocation();
  // /mehr/editor-code — розділ «Einstellungen», /editor-code — з «Klausuren»: туди й повертаємось
  const backTo = location.state?.from ?? (location.pathname.startsWith("/mehr") ? "/mehr" : "/testen");

  return (
    <section className="flex flex-1 flex-col lg:max-w-186">
      <PageHeader backTo={backTo} eyebrow="Bearbeiten" title="Editor-Code" />
      {editor ? <ActiveCode editor={editor} /> : <UnlockForm backTo={backTo} />}
    </section>
  );
};

export default EditorCode;
