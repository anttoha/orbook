import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Button from "../ui/Button";
import { KeyIcon } from "../ui/icons";
import TextField from "../ui/TextField";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { linkCodeOf, useLinkCode } from "../../shared/store/linkCodeStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { lockDuration, teacherLoginErrorText } from "../../shared/utils/authErrors";

// ─────────────────────────────────────────────────────────────
// Вхід учителя Lehrer-Code (макети handy-02/03, pc-01): POST /api/auth/teacher.
// Пароль класу вчителю не потрібен. Код ніде не зберігаємо — лише до відповіді сервера.
// Звертаємось на «Sie».
// ─────────────────────────────────────────────────────────────
const TeacherLoginForm = ({ schoolClass }) => {
  const loginTeacher = usePlanStore((s) => s.loginTeacher);
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // на ПК підказка під полем, на телефоні — плашка внизу
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  // часть 25: QR с листа учителя — код уже вписан (из ссылки после «#»), «Anmelden» человек жмёт сам
  const [code, setCode] = useState(() => linkCodeOf(useLinkCode.getState().link, "teacher") ?? "");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  useEffect(() => () => clearTimeout(timerRef.current), []); // екран закрили — таймер не потрібен

  const startLock = (ms) => {
    if (!ms) return;
    setLocked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), ms);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!code.trim()) return inputRef.current?.focus();
    if (busy || locked) return;
    setBusy(true);
    setError(null);
    try {
      await loginTeacher(code);
      useLinkCode.getState().clear();
      useUserStore.getState().setTipsPending(true); // часть 25: «Kurz erklärt» после первого входа
      navigate("/", { replace: true }); // прибрати ?zugang=lehrkraft з адреси
    } catch (err) {
      setError(teacherLoginErrorText(err));
      startLock(lockDuration(err));
      setBusy(false);
    }
  };

  const classText = schoolClass ? `der ${schoolClass}` : "der Klasse";

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      <p className="mt-5 text-row text-muted lg:hidden">Mit Ihrem Lehrer-Code sehen Sie den Plan {classText} und tragen Tests und Hausaufgaben für die Klasse ein.</p>
      <TextField
        ref={inputRef}
        id="teacher-code"
        label="Lehrer-Code"
        className="mt-4.5 lg:mt-0"
        value={code}
        onChange={(event) => {
          setCode(event.target.value);
          if (!locked) setError(null);
        }}
        error={error}
        hint={isDesktop ? "Den Code bekommen Sie vom Admin der Klasse." : null}
        placeholder="ORB-L-XXXX-XX"
        maxLength={40}
        readOnly={busy}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputClassName="h-13.5 text-brand tracking-code"
      />
      <Button type="submit" variant="primary" disabled={busy || locked} className="mt-4.5 flex-none">
        <KeyIcon className="size-4" /> {busy ? "Wird geprüft…" : "Anmelden"}
      </Button>

      <div className="mt-4 hidden items-center justify-between lg:flex">
        <Link to="/datenschutz" className="text-hint font-semibold text-muted">
          Datenschutz
        </Link>
        <p className="text-hint text-faint">Enter zum Anmelden</p>
      </div>

      {/* телефон: плашка внизу екрана */}
      <div className="mt-auto flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted lg:hidden">
        <Lock className="size-4 shrink-0" />
        <p>Den Code bekommen Sie vom Admin der Klasse. Er bleibt nur auf diesem Gerät.</p>
      </div>
    </form>
  );
};

export default TeacherLoginForm;
