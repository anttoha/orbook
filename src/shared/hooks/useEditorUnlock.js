import { useState } from "react";
import { toast } from "sonner";
import { retryText } from "../api/api";
import { linkCodeOf, useLinkCode } from "../store/linkCodeStore";
import { usePlanStore } from "../store/planStore";
import { unlockErrorText } from "../utils/examRules";

// ─────────────────────────────────────────────────────────────
// Поле Editor-Code: і для сторінки, і для вікна.
// Код живе тільки тут, до відповіді сервера, і ніде не зберігається (так вимагає гайд).
// ─────────────────────────────────────────────────────────────
export const useEditorUnlock = (onUnlocked) => {
  const unlockEditor = usePlanStore((s) => s.unlockEditor);
  // часть 25: открыли QR с Editor-Code — код уже вписан, «Freischalten» человек жмёт сам
  const [code, setCode] = useState(() => linkCodeOf(useLinkCode.getState().link, "editor") ?? "");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); // не перезавантажувати сторінку
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlockEditor(code);
      setCode("");
      useLinkCode.getState().clear(); // код из ссылки больше не нужен
      toast.success("Editor-Code freigeschaltet", { duration: 3000 });
      onUnlocked();
    } catch (e) {
      setError(unlockErrorText(e, retryText));
    } finally {
      setBusy(false);
    }
  };

  return { code, setCode: (value) => { setCode(value); setError(null); }, error, busy, submit };
};
