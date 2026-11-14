import { Lock } from "lucide-react";
import TextField from "../ui/TextField";

// Поле коду: регістр і дефіси сервер прощає сам, тому нічого не форматуємо
export const EditorCodeField = ({ code, onChange, error }) => (
  <TextField
    id="editor-code"
    label="Code"
    value={code}
    onChange={(event) => onChange(event.target.value)}
    error={error}
    placeholder="ORB-E-XXXX-XXXX"
    maxLength={40}
    autoComplete="off"
    autoCapitalize="characters"
    spellCheck={false}
    inputClassName="h-13.5 text-brand tracking-code"
  />
);

// Плашка внизу
export const EditorCodeNote = ({ className }) => (
  <div className={`flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted ${className ?? ""}`}>
    <Lock className="size-4 shrink-0" />
  </div>
);
