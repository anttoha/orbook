import AuthAside from "../components/auth/AuthAside";
import LoginForm from "../components/auth/LoginForm";
import OrbitMark from "../components/ui/OrbitMark";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";

// Екран «Zugang»: вхід паролем класу (docs/frontend/02-zugang.md, макети 01 і 02).
// Телефон: знак і назва вгорі, форма внизу. ПК: дві половини, форма по центру правої.
const AuthPage = () => {
  const schoolClass = usePublicInfo()?.className; // поки не прийшло — текст без назви класу

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-2">
      <AuthAside className={schoolClass} />

      <main className="flex min-h-dvh flex-col px-gutter-auth pt-32.5 pb-8.5 lg:items-center lg:justify-center lg:py-10">
        {/* заголовок телефона */}
        <div className="lg:hidden">
          <OrbitMark className="size-13.5" />
          <h1 className="mt-3 text-display text-ink">ORBook</h1>
          <p className="mt-2.75 text-input leading-6 text-muted">
            Stundenplan, Vertretungen und Klausuren{schoolClass ? ` der ${schoolClass}` : ""} — an einem Ort.
          </p>
        </div>

        <div className="mt-auto w-full lg:mt-0 lg:w-95">
          {/* заголовок ПК */}
          <div className="mb-6 hidden lg:block">
            <p className="text-hint font-extrabold text-accent-ink">Willkommen</p>
            <h1 className="mt-2.5 text-lobby text-ink">Klasse öffnen</h1>
            <p className="mt-3 text-body leading-5.75 text-muted">Ein Passwort für die ganze Klasse. Keine Konten, keine Namen.</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
