import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { useAdminStore } from "../../shared/store/adminStore";
import { adminLoginErrorText, lockDuration } from "../../shared/utils/authErrors";

// Форма входу адміна (макети 39 і 41). Після успіху оболонка сама покаже адмінку.
const AdminLoginForm = () => {
  const login = useAdminStore((s) => s.login);
  const loginNotice = useAdminStore((s) => s.loginNotice); // «Bitte erneut anmelden.», коли сесія закінчилась
  const inputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  // 5 помилок → 30 хвилин паузи: кнопку вимикаємо на цей час
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []); // екран закрили — таймер не потрібен
  const startLock = (ms) => {
    if (!ms) return;
    setLocked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), ms);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) return inputRef.current?.focus();
    if (loading || locked) return;
    setLoading(true);
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(adminLoginErrorText(err));
      startLock(lockDuration(err));
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        ref={inputRef}
        id="admin-password"
        type="password"
        label="Admin-Passwort"
        placeholder="Passwort"
        hint={loginNotice ?? "Nach 5 Fehlversuchen 30 Minuten gesperrt."}
        error={error}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (!locked) setError(null);
        }}
        readOnly={loading}
        autoComplete="current-password"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <Button type="submit" variant="primary" disabled={loading || locked} className="mt-4 w-full flex-none gap-1.5">
        {!loading && <ChevronRight className="size-4" />}
        {loading ? "Wird geprüft…" : "Anmelden"}
      </Button>
      <Link to="/" className="mt-5 block text-center text-hint font-extrabold text-muted lg:text-left">
        <span className="hidden lg:inline">← </span>Zurück zur App
      </Link>
    </form>
  );
};

export default AdminLoginForm;
