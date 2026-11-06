import { ChevronLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AuthAside from "../components/auth/AuthAside";
import LoginForm from "../components/auth/LoginForm";
import TeacherLoginForm from "../components/auth/TeacherLoginForm";
import OrbitMark from "../components/ui/OrbitMark";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";

// Вхід учителя (частина 14, handy-02, pc-01). Телефон: шапка з «назад»; ПК: права половина як у класу
const TeacherAccess = ({ schoolClass }) => (
  <main className="flex min-h-dvh flex-col px-gutter pt-6 pb-6 lg:items-center lg:justify-center lg:px-gutter-auth lg:py-10">
    <div className="flex w-full flex-1 flex-col lg:w-95 lg:flex-none">
      <header className="flex items-end gap-2.5 lg:hidden">
        <Link to={{ search: "" }} aria-label="Zurück" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          <ChevronLeft className="size-4.5" />
        </Link>
        <div className="space-y-1">
          <p className="text-hint font-extrabold text-faint">Zugang</p>
          <h1 className="text-title text-ink">Lehrkraft</h1>
        </div>
      </header>

      <div className="mb-6 hidden lg:block">
        <Link to={{ search: "" }} className="flex items-center gap-1 text-hint font-extrabold text-muted">
          <ChevronLeft className="size-3" /> Zurück zum Klassenpasswort
        </Link>
        <p className="mt-10 text-hint font-extrabold text-accent-ink">Lehrkraft</p>
        <h1 className="mt-2.5 text-lobby text-ink">Mit Code anmelden</h1>
        <p className="mt-3 text-body leading-5.75 text-muted">Sie sehen den Plan {schoolClass ? `der ${schoolClass}` : "der Klasse"} und tragen Klausuren, Tests und Hausaufgaben für die Klasse ein.</p>
      </div>
      <TeacherLoginForm schoolClass={schoolClass} />
    </div>
  </main>
);

// Екран «Zugang»: вхід паролем класу (docs/frontend/02-zugang.md, макети 01 і 02).
// Телефон: знак і назва вгорі, форма внизу. ПК: дві половини, форма по центру правої.
// ?zugang=lehrkraft — вхід учителя: адреса, щоб кнопка «назад» браузера поверталась до пароля
const AuthPage = () => {
  const schoolClass = usePublicInfo()?.className; // поки не прийшло — текст без назви класу
  const [params] = useSearchParams();

  if (params.get("zugang") === "lehrkraft") {
    return (
      <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-2">
        <AuthAside className={schoolClass} />
        <TeacherAccess schoolClass={schoolClass} />
      </div>
    );
  }

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
