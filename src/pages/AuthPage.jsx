import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { api, retryText } from "../shared/api/api";
import { usePlanStore } from "../shared/store/planStore";
import { cn } from "../shared/utils/cn";
import Section from "../components/ui/Section";

// ─────────────────────────────────────────────────────────────
// Екран «Zugang» — вхід паролем класу (гайд docs/frontend/02-zugang.md).
//   GET /api/public/info  — назва класу для підзаголовка (до входу)
//   POST /api/auth/login  — перевірка пароля; далі planStore сам завантажує дані
// Помилки показуємо текстом сервера (він німецькою і готовий до показу).
// ─────────────────────────────────────────────────────────────
const AuthPage = () => {
  const login = usePlanStore((s) => s.login); // вхід (кидає ApiError при помилці)
  const loginNotice = usePlanStore((s) => s.loginNotice); // «Bitte erneut anmelden.» після 401
  const inputRef = useRef(null); // поле пароля (повертаємо туди фокус після помилки)

  const [className, setClassName] = useState(null); // «8a» з /api/public/info
  const [passwordValue, setPasswordValue] = useState(""); // що ввели
  const [error, setError] = useState(null); // текст помилки під полем
  const [loading, setLoading] = useState(false); // іде перевірка
  const [lockedUntil, setLockedUntil] = useState(0); // після 429 кнопка вимкнена до цього часу (мс)

  // Назва класу для підзаголовка (якщо не вийде — просто без неї)
  useEffect(() => {
    api("/public/info")
      .then((info) => setClassName(info.className))
      .catch(() => {});
  }, []);

  // Коли блокування скінчиться — знову ввімкнути кнопку
  useEffect(() => {
    if (!lockedUntil) return undefined;
    const id = setTimeout(() => setLockedUntil(0), lockedUntil - Date.now());
    return () => clearTimeout(id);
  }, [lockedUntil]);

  const handleLogin = async (e) => {
    e.preventDefault(); // не перезавантажувати сторінку
    if (!passwordValue || loading || lockedUntil) return;
    setLoading(true);
    setError(null);
    try {
      await login(passwordValue); // успіх — HomePage сам покаже застосунок
    } catch (err) {
      if (err.code === "wrong_password") {
        // «Passwort stimmt nicht. Noch 4 Versuche.» — пароль не очищаємо
        const left = err.details?.attemptsLeft;
        setError(left != null ? `${err.message} Noch ${left} ${left === 1 ? "Versuch" : "Versuche"}.` : err.message);
      } else if (err.status === 429) {
        setError(retryText(err)); // «Bitte in 10 Minuten erneut versuchen.»
        setLockedUntil(Date.now() + (err.retryAfter ?? 60) * 1000); // кнопка вимкнена до кінця блокування
      } else {
        setError(err.message); // немає мережі, сервер не налаштований тощо
      }
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const message = error ?? loginNotice; // що показати під полем
  const isPasswordValid = !error; // червона рамка тільки при помилці

  return (
    <Section className="bg-paper" containerClassName="flex flex-col min-h-screen py-7.5 gap-4 max-w-desktop">
      <div className="space-y-4 mb-auto pt-27.5">
        <div className="" />
        <h2 className="text-display font-black text-ink">ORBook</h2>
        <p className="font-normal text-input text-muted">
          {/* поки public/info вантажиться — без назви класу */}
          Stundenplan, Vertretungen und Klausuren{className ? ` der ${className}` : ""} — an einem Ort
        </p>
      </div>
      <form onSubmit={handleLogin} className="mt-auto">
        <label htmlFor="class-password" className="block font-bold text-label mx-1.5 mb-1.5 text-ink">
          Klassenpasswort
        </label>
        <input
          ref={inputRef}
          id="class-password"
          name="password"
          type="password"
          autoComplete="current-password"
          // інакше телефон зробить першу літеру великою — і пароль не підійде
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={loading}
          value={passwordValue}
          onChange={(e) => {
            setPasswordValue(e.target.value);
            if (!lockedUntil) setError(null); // почали друкувати — ховаємо помилку
          }}
          placeholder="Passwort eingeben"
          className={cn(
            "w-full rounded-2xl bg-card h-12.5 px-4.25 text-input font-normal text-ink placeholder:text-faint outline-none focus:ring-2 focus:ring-accent/30 mb-1.5 transition disabled:opacity-60",
            isPasswordValid ? "border border-transparent" : "border border-danger focus:ring-danger/30",
          )}
        />
        {message ? (
          <div className={cn("flex items-center gap-1.5", error ? "text-danger" : "text-muted")}>
            <CircleAlert className="size-3 shrink-0" />
            <p className="text-label font-normal">{message}</p>
          </div>
        ) : (
          <p className="text-caption font-normal text-muted">Steht in der Klassengruppe.</p>
        )}

        <button
          className="py-3.5 w-full flex gap-3 justify-center mt-4 rounded-full bg-accent text-on-accent text-body font-bold disabled:opacity-50"
          type="submit"
          disabled={loading || Boolean(lockedUntil)}
        >
          <svg className="w-1 h-2" /> {loading ? "Wird geprüft…" : "Öffnen"}
        </button>
      </form>
      <div className="flex justify-between text-caption">
        <Link to="/datenschutz" className={cn("font-bold text-muted")}>
          Datenschutz
        </Link>
        <p className="font-normal text-faint">Keine offizielle App von Indiware</p>
      </div>
    </Section>
  );
};

export default AuthPage;
