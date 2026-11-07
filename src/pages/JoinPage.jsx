import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronRight, Link2, RefreshCw, TriangleAlert, Users } from "lucide-react";
import AuthAside from "../components/auth/AuthAside";
import LoginForm from "../components/auth/LoginForm";
import Button from "../components/ui/Button";
import OrbitMark from "../components/ui/OrbitMark";
import { previewInvite } from "../shared/api/invite";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";
import { usePlanStore } from "../shared/store/planStore";
import { classTitle, joinProblem } from "../shared/utils/invite";

// Картка «Klasse 9b · Einladung zu ORBook» (макет handy-11); поки перевіряємо посилання — скелет
const InviteCard = ({ className, loading }) => (
  <div className="flex items-center gap-3 rounded-card bg-card px-3.5 py-4">
    {loading ? (
      <>
        <span className="size-10 shrink-0 animate-pulse rounded-full bg-skeleton" />
        <span className="flex flex-1 flex-col gap-2.5">
          <span className="h-3.25 w-28 animate-pulse rounded-full bg-skeleton" />
          <span className="h-2.5 w-44 animate-pulse rounded-full bg-skeleton" />
        </span>
      </>
    ) : (
      <>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
          <Users className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-subhead font-extrabold text-ink">{classTitle(className)}</span>
          <span className="block text-label text-muted">Einladung zu ORBook</span>
        </span>
      </>
    )}
  </div>
);

// «Dieser Link gilt nicht mehr» (макет handy-13): далі звичайне поле коду
const InvalidBanner = () => (
  <div role="status" className="mb-6 flex gap-2.5 rounded-field bg-danger-tint px-3.5 py-3 text-danger">
    <Link2 className="mt-0.5 size-4 shrink-0" />
    <div>
      <p className="text-label font-extrabold">Dieser Link gilt nicht mehr</p>
      <p className="mt-0.5 text-caption leading-4.25">Der Admin hat ihn geändert oder ausgeschaltet. Mit Code geht es trotzdem:</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Сторінка посилання-запрошення /i/:token (частина 16, макети handy-11…14, pc-09, pc-10).
// Вже увійшли → одразу в застосунок. Інакше: перевіряємо посилання (GET /public/invite/…),
// «Beitreten» = вхід кодом (POST /auth/join), далі як після звичайного входу (вибір курсів).
// ─────────────────────────────────────────────────────────────
const JoinPage = () => {
  const { token } = useParams();
  const me = usePlanStore((s) => s.me);
  const start = usePlanStore((s) => s.start);
  const join = usePlanStore((s) => s.join);
  const publicClass = usePublicInfo()?.className; // назва для заголовка, поки посилання перевіряється
  const [check, setCheck] = useState({ status: "loading" }); // loading | ok | problem
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);

  // Хто я? (HomePage тут немає — питаємо самі; той самий запит, що й при звичайному старті)
  useEffect(() => {
    if (me === undefined) start();
  }, [me, start]);

  // Перевірка посилання: живе? місця є?
  useEffect(() => {
    let cancelled = false;
    previewInvite(token)
      .then(({ className, full }) => !cancelled && setCheck(full ? { status: "problem", className, problem: joinProblem({ code: "code_full" }) } : { status: "ok", className }))
      .catch((error) => !cancelled && setCheck({ status: "problem", problem: joinProblem(error) }));
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  if (me) return <Navigate to="/" replace />; // уже в класі — посилання не потрібне

  const className = check.className ?? publicClass;
  const retry = () => {
    setCheck({ status: "loading" });
    setAttempt((a) => a + 1);
  };
  const beitreten = async () => {
    setBusy(true);
    try {
      await join(token); // успіх: me з'явиться, і сторінка сама перейде в застосунок
    } catch (error) {
      setCheck((c) => ({ ...c, status: "problem", problem: joinProblem(error) }));
      setBusy(false);
    }
  };

  const problem = check.status === "problem" ? check.problem : null;
  const invalid = problem?.kind === "invalid";

  const renderBottom = () => {
    if (invalid) {
      return (
        <>
          <InvalidBanner />
          <LoginForm />
        </>
      );
    }
    return (
      <>
        <p className="mb-2.5 text-hint font-extrabold text-accent-ink lg:hidden">Du wurdest eingeladen</p>
        <InviteCard className={className} loading={check.status === "loading"} />
        {problem ? (
          <>
            <p role="alert" className="mt-4 flex gap-1.5 text-label text-danger">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {problem.text}
                {problem.kind === "full" && <span className="block">Frag den Admin, ob er das Limit erhöht.</span>}
              </span>
            </p>
            <Button className="mt-4 w-full flex-none" onClick={retry}>
              <RefreshCw className="size-4" /> Nochmal versuchen
            </Button>
          </>
        ) : (
          <>
            <p className="mt-4 text-caption text-faint">Kein Konto, keine E-Mail — ein Tippen genügt.</p>
            <Button variant="primary" className="mt-4 w-full flex-none gap-1.5" disabled={check.status !== "ok" || busy} onClick={beitreten}>
              {!busy && <ChevronRight className="size-4" />}
              {busy ? "Wird geprüft…" : "Beitreten"}
            </Button>
          </>
        )}
        <p className="mt-4 text-center text-label text-muted">
          Schon einen Code?{" "}
          <Link to="/" className="font-extrabold text-accent-ink">
            Mit Code anmelden
          </Link>
        </p>
        <div className="mt-4 flex items-center justify-between lg:mt-5">
          <Link to="/datenschutz" className="text-caption font-semibold text-muted lg:text-hint">
            Datenschutz
          </Link>
          <p className="text-caption text-faint lg:hidden">Keine offizielle App von Indiware</p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-2">
      <AuthAside className={className} />
      <main className="flex min-h-dvh flex-col px-gutter-auth pt-32.5 pb-8.5 lg:items-center lg:justify-center lg:py-10">
        {/* заголовок телефона — як на екрані входу */}
        <div className="lg:hidden">
          <OrbitMark className="size-13.5" />
          <h1 className="mt-3 text-display text-ink">ORBook</h1>
          <p className="mt-2.75 text-input leading-6 text-muted">Stundenplan, Vertretungen und Klausuren{className ? ` der ${className}` : ""} — an einem Ort.</p>
        </div>
        <div className="mt-auto w-full lg:mt-0 lg:w-95">
          {/* заголовок ПК */}
          <div className="mb-6 hidden lg:block">
            <p className="text-hint font-extrabold text-accent-ink">Du wurdest eingeladen</p>
            <h2 className="mt-2.5 text-lobby text-ink">{classTitle(className)}</h2>
            <p className="mt-3 text-body leading-5.75 text-muted">
              {invalid ? "Dieser Einladungslink gilt nicht mehr — mit Zugangscode oder Klassenpasswort geht es trotzdem." : `ORBook zeigt Stundenplan, Vertretungen und Klausuren${className ? ` der ${className}` : ""}. Kein Konto, keine E-Mail.`}
            </p>
          </div>
          {renderBottom()}
        </div>
      </main>
    </div>
  );
};

export default JoinPage;
