import AdminLoginForm from "../components/admin/AdminLoginForm";
import { LockIcon } from "../components/ui/icons";
import OrbitMark from "../components/ui/OrbitMark";

// «Admin · Login» (макети 39 телефон, 41 ПК). Свій пароль, не пароль класу.
// Телефон: замок і заголовок угорі, форма внизу. ПК: ліва фіолетова половина, форма праворуч.
const AdminLogin = ({ className: schoolClass }) => (
  <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[43fr_57fr]">
    {/* ліва половина ПК */}
    <aside className="hidden min-h-dvh flex-col bg-tint px-15 py-11 lg:flex">
      <div className="flex items-center gap-3">
        <OrbitMark className="size-9.5" />
        <p className="text-brand text-ink">ORBook</p>
      </div>
      <div className="my-auto">
        <span className="grid size-18 place-items-center rounded-full bg-ink text-paper">
          <LockIcon className="size-7" />
        </span>
        <p className="mt-5 text-landing text-ink">Admin</p>
        <p className="mt-6 max-w-120 text-lead leading-6 text-accent-ink">
          Codes, Tests, Klassenpasswort und Plan-Einstellungen{schoolClass ? ` der ${schoolClass}` : ""}.
        </p>
      </div>
    </aside>

    <main className="flex min-h-dvh flex-col px-gutter-auth pt-35 pb-8.5 lg:items-center lg:justify-center lg:py-10">
      {/* заголовок телефона */}
      <div className="lg:hidden">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-on-accent">
          <LockIcon className="size-5.5" />
        </span>
        <h1 className="mt-3 text-display text-ink">Admin</h1>
        <p className="mt-2.75 text-input leading-6 text-muted">Nur für den Betreiber von ORBook. Eigenes Passwort, nicht das der Klasse.</p>
      </div>

      <div className="mt-auto w-full lg:mt-0 lg:w-95">
        {/* заголовок ПК */}
        <div className="mb-6 hidden lg:block">
          <h1 className="text-lobby text-ink">Anmelden</h1>
          <p className="mt-3 text-body text-muted">Eigenes Passwort — nicht das der Klasse.</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  </div>
);

export default AdminLogin;
