import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { isTeacher } from "../../shared/utils/examRules";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { LeaveIcon } from "../ui/icons";
import { translate } from "../../shared/i18n/translate";

// Рядок «Klasse verlassen» і діалог підтвердження (макет 28).
// Вихід стирає кеш плану, нотатки й налаштування лишаються (docs/frontend/02-zugang.md).
// className — інший вигляд рядка (у меню «Einstellungen» на ПК він як пункт меню).
// Учитель не «покидає клас», а виходить: «Abmelden» і текст на «Sie».
// Частина 29: класів кілька — виходимо лише з відкритого (POST /auth/leave), решта лишаються
const TEXTS = {
  class: { get label() { return translate("Klasse verlassen"); }, get title() { return translate("Klasse verlassen?"); }, get text() { return translate("Du musst das Klassenpasswort erneut eingeben. Deine Notizen bleiben auf dem Gerät, solange du den Sync-Code hast."); }, get stay() { return translate("Bleiben"); }, go: "Verlassen" },
  teacher: { get label() { return translate("Abmelden"); }, title: "Abmelden?", get text() { return translate("Danach müssen Sie den Lehrer-Code erneut eingeben."); }, get stay() { return translate("Abbrechen"); }, get go() { return translate("Abmelden"); } },
};

const LeaveClass = ({ className }) => {
  const navigate = useNavigate();
  const logout = usePlanStore((s) => s.logout);
  const leaveClass = usePlanStore((s) => s.leaveClass);
  const texts = TEXTS[usePlanStore((s) => (isTeacher(s.me) ? "teacher" : "class"))];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const leave = async () => {
    setBusy(true);
    const { activeId, list } = useClasses.getState();
    if (activeId == null || list.length <= 1) {
      await logout(); // без мережі теж виходить: помилку ковтає сам store
      navigate("/", { replace: true }); // після нового входу — стартовий екран, а не «Mehr»
      return;
    }
    try {
      await leaveClass(activeId);
      navigate("/klassen", { replace: true }); // інші класи лишились
    } catch {
      setBusy(false); // немає мережі — лишаємось у класі
    }
  };

  return (
    <li>
      {className ? (
        <button type="button" onClick={() => setOpen(true)} className={className}>
          <LeaveIcon className="size-4 shrink-0" /> {texts.label}
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex h-12.5 w-full items-center gap-3.25 text-danger">
          <LeaveIcon className="size-4.5 shrink-0" />
          <span className="text-row font-medium">{texts.label}</span>
        </button>
      )}

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        icon={<LeaveIcon className="size-6.5 text-danger" />}
        title={texts.title}
        text={texts.text}
      >
        <Button onClick={() => setOpen(false)}>{texts.stay}</Button>
        <Button variant="danger" onClick={leave} disabled={busy}>
          <LeaveIcon className="size-4" /> {texts.go}
        </Button>
      </ConfirmDialog>
    </li>
  );
};

export default LeaveClass;
