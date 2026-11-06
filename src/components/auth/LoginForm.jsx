import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { usePlanStore } from "../../shared/store/planStore";
import { lockDuration, loginErrorText } from "../../shared/utils/authErrors";

// Форма входу паролем класу. Після успіху HomePage сам покаже застосунок.
const LoginForm = () => {
  const login = usePlanStore((s) => s.login);
  const loginNotice = usePlanStore((s) => s.loginNotice); // «Bitte erneut anmelden.», коли сесія закінчилась
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
        label="Klassenpasswort"
        placeholder="Passwort eingeben"
        hint={loginNotice ?? "Steht in der Klassengruppe."}
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
        {loading ? "Wird geprüft…" : "Öffnen"}
      </Button>

      <p className="mt-4 text-center text-label text-muted">
        Lehrkraft?{" "}
        <Link to={{ search: "?zugang=lehrkraft" }} className="font-extrabold text-accent-ink">
          Mit Lehrer-Code anmelden
        </Link>
      </p>

      <div className="mt-4 flex items-center justify-between lg:mt-5">
        <Link to="/datenschutz" className="text-caption font-semibold text-muted lg:text-hint">
          Datenschutz
        </Link>
        <p className="text-caption text-faint lg:hidden">Keine offizielle App von Indiware</p>
        <p className="hidden text-hint text-faint lg:block">Enter zum Öffnen</p>
      </div>
    </form>
  );
};

export default LoginForm;
