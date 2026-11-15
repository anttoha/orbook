import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import { DemoCard, DemoRow } from "../demo/DemoCard";
import { api, retryText } from "../../shared/api/api";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { unlockErrorText } from "../../shared/utils/examRules";

// Демо (часть 33): готовый Editor-Code — только после входа и только на демо-сервере.
// На проде запроса нет совсем (meta.demo = false) и карточки нет.
const DemoEditorCode = ({ onUnlocked, className }) => {
  const t = useT();
  const demo = usePlanStore((s) => s.meta?.demo);
  const unlockEditor = usePlanStore((s) => s.unlockEditor);
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!demo) return;
    const controller = new AbortController(); // экран закрыли — ответ не нужен
    api("/demo/editor-code", { signal: controller.signal })
      .then((data) => setCode(data?.code ?? null))
      .catch(() => {}); // нет кода (другой класс) — просто без карточки
    return () => controller.abort();
  }, [demo]);

  if (!demo || !code) return null;

  const unlock = async () => {
    setBusy(true);
    try {
      await unlockEditor(code);
      toast.success(t("Editor-Code freigeschaltet"), { duration: 3000 });
      onUnlocked();
    } catch (error) {
      toast.error(unlockErrorText(error, retryText));
      setBusy(false);
    }
  };

  return (
    <DemoCard className={className}>
      <DemoRow icon={PenLine} label={t("Editor")} code={code} action={t("Freischalten")} busy={busy} onClick={unlock} />
    </DemoCard>
  );
};

export default DemoEditorCode;
