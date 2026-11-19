import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { usePlanStore } from "../../shared/store/planStore";
import { lockDuration, loginErrorText } from "../../shared/utils/authErrors";
import { useT } from "../../shared/hooks/useT";

// Форма входу: Zugangscode (ORB-A-…, частина 14c) або старий пароль класу — одне поле, сервер розбереться сам.
// Після успіху HomePage сам покаже застосунок.
const LoginForm = () => {
  const t = useT();
  const login = usePlanStore((s) => s.login);
  const inputRef = useRef(null);

  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef(null);
  const startLock = (ms) => {
    if (!ms) return;
    setLocked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), ms);
  };
  useEffect(() => () => clearTimeout(timerRef.current), []); // екран закрили — таймер більше не потрібен

  const handleSubmit = async (event) => {
    event.preventDefault(); // браузер не перезавантажує сторінку
    if (!password) return inputRef.current?.focus();
    if (loading || locked) return;

    setLoading(true);
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(loginErrorText(err)); // пароль не стираємо: людина може виправити одну літеру
      startLock(lockDuration(err));
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        ref={inputRef}
        id="class-password"
        name="password"
        type="password"
        label={t("Zugangscode oder Klassenpasswort")}
        placeholder="ORB-A-XXXX-XXXX"
        hint={t("Vom Admin oder aus der Klassengruppe.")}
        error={error}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (!locked) setError(null); // почали друкувати — ховаємо помилку
        }}
        readOnly={loading} // не disabled: так поле не втрачає фокус і клавіатура телефона не ховається
        autoComplete="current-password"
        autoCapitalize="off" // інакше телефон зробить першу літеру великою, і пароль не підійде
        autoCorrect="off"
        spellCheck={false}
      />

      <Button type="submit" variant="primary" disabled={loading || locked} className="mt-4 w-full flex-none gap-1.5">
        {!loading && <ChevronRight className="size-4" />}
        {loading ? t("Wird geprüft…") : t("Öffnen")}
      </Button>

      <p className="mt-4 text-center text-label text-muted">
        {t("Lehrkraft?")}{" "}
        <Link to={{ search: "?zugang=lehrkraft" }} className="font-extrabold text-accent-ink">
          {t("Mit Lehrer-Code anmelden")}
        </Link>
      </p>

      <div className="mt-4 flex items-center justify-between lg:mt-5">
        <Link to="/datenschutz" className="text-caption font-semibold text-muted lg:text-hint">
          {t("Datenschutz")}
        </Link>
        <p className="text-caption text-faint lg:hidden">{t("Keine offizielle App von Indiware")}</p>
        <p className="hidden text-hint text-faint lg:block">{t("Enter zum Öffnen")}</p>
      </div>
    </form>
  );
};

export default LoginForm;
