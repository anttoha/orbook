import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AccessDialogs from "../components/admin/access/AccessDialogs";
import AccessList from "../components/admin/access/AccessList";
import AccessTable from "../components/admin/access/AccessTable";
import NewAccessSheet from "../components/admin/access/NewAccessSheet";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import SearchField from "../components/admin/SearchField";
import Button from "../components/ui/Button";
import { KeyIcon } from "../components/ui/icons";
import { useAccessActions } from "../shared/hooks/useAccessActions";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";
import { summaryText } from "../shared/utils/accessCodes";
import RoundButton from "../components/ui/RoundButton";

const matches = (code, query) => `${code.label} ${code.masked}`.toLowerCase().includes(query.trim().toLowerCase());

// Порожньо: є лише Klassenpasswort (макет handy-07)
const EmptyHint = ({ onNew }) => (
  <div className="flex flex-col items-center gap-3 px-5 pt-8 text-center">
    <span className="grid size-16 place-items-center rounded-full bg-tint text-accent-ink">
      <KeyIcon className="size-6.5" />
    </span>
    <p className="mt-2 text-dialog text-ink">Noch keine Zugangscodes</p>
    <p className="max-w-80 text-body-sm leading-5.5 text-muted">Ein Code für eine Gruppe (Eltern, Vertretung) oder einer pro Schüler — jeder einzeln sperrbar, mit Ablaufdatum.</p>
    {/* частина 16: «Einladen» є в меню коду — без коду його не знайти */}
    <p className="max-w-80 text-caption text-faint">Link und QR zum Einladen: einen Code erstellen, dann ⋮ → »Einladen«.</p>
    <Button variant="primary" className="mt-2 flex-none px-5" onClick={onNew}>
      <Plus className="size-4.5" /> Ersten Code erstellen
    </Button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Zugangscodes» (частина 14c, макети handy-01…08, pc-01…07): коди входу в застосунок.
// Телефон — картки, ПК — таблиця. Останній рядок — старий Klassenpasswort.
// ?neu=1 у адресі одразу відкриває вікно нового коду
// ─────────────────────────────────────────────────────────────
const AdminAccessCodes = () => {
  const { today } = useNow();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const access = useAdminStore((s) => s.access);
  const reloadAccess = useAdminStore((s) => s.reloadAccess);
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const actions = useAccessActions();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null); // відкрите вікно: { kind, code }

  // Щоразу свіжий список (пристрої могли увійти чи вийти); «Schuljahresende» — з налаштувань
  useEffect(() => {
    reloadAccess();
    ensureSettings();
  }, [reloadAccess, ensureSettings]);

  const codes = access.data?.codes ?? [];
  const password = access.data?.classPassword ?? null;
  const list = codes.filter((code) => matches(code, query));
  const openNew = () => setParams({ neu: "1" });

  // Вимкнення — з питанням «… sperren?», увімкнення — одразу
  const toggle = (code) => (code.active ? setAction({ kind: "lock", code }) : actions.toggle(code));
  const togglePassword = () => (password.enabled ? setAction({ kind: "password-off" }) : actions.setPassword(true));
  const onAction = (kind, code) => {
    if (kind === "password-change") return navigate("/admin/passwoerter");
    if (kind === "password-toggle") return togglePassword();
    if (kind === "lock" && !code.active) return actions.toggle(code);
    return setAction({ kind, code });
  };

  const addButton = isDesktop ? (
    <Button variant="primary" className="flex-none px-5" onClick={openNew}>
      <Plus className="size-4.5" /> Neuer Code
    </Button>
  ) : (
    <RoundButton aria-label="Neuer Code" onClick={openNew} look="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent">
      <Plus className="size-5" />
    </RoundButton>
  );

  const renderBody = () => {
    if (access.status === "loading") return <AdminSkeleton rows={4} />;
    if (access.status === "error") return <AdminError error={access.error} onRetry={reloadAccess} />;
    if (isDesktop) {
      return (
        <>
          <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
            <AccessTable codes={list} password={query ? null : password} today={today} onToggle={toggle} onAction={onAction} onPasswordToggle={togglePassword} />
          </div>
          {!codes.length && <EmptyHint onNew={openNew} />}
        </>
      );
    }
    return (
      <>
        {codes.length > 0 && <p className="mb-2 text-hint font-extrabold text-faint">{summaryText(codes, password)}</p>}
        <AccessList codes={codes} password={password} today={today} onToggle={toggle} onMenu={(code) => setAction({ kind: "menu", code })} onPasswordToggle={togglePassword} onPasswordMenu={() => setAction({ kind: "password-menu" })} />
        {!codes.length && <EmptyHint onNew={openNew} />}
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Zugangscodes" backTo="/admin/einstellungen" actions={[isDesktop && <SearchField key="search" value={query} onChange={setQuery} placeholder="Code suchen" className="w-50" />, <span key="add">{addButton}</span>]} />
      <div>{renderBody()}</div>

      <NewAccessSheet open={params.get("neu") === "1"} schoolId={Number(params.get("schule")) || null} onClose={() => setParams({}, { replace: true })} />
      <AccessDialogs action={action} password={password} onChange={setAction} onPasswordAction={onAction} />
    </section>
  );
};

export default AdminAccessCodes;
