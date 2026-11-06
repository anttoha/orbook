import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Folder, LogOut, Plus, Server, Table2 } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import CodeDialogs from "../components/admin/CodeDialogs";
import CodeTable from "../components/admin/CodeTable";
import CountTiles from "../components/admin/CountTiles";
import PlanHealthCard from "../components/admin/PlanHealthCard";
import RecentEvents from "../components/admin/RecentEvents";
import MenuRow from "../components/more/MenuRow";
import Button from "../components/ui/Button";
import { LockIcon, RenewIcon } from "../components/ui/icons";
import ListCard from "../components/ui/ListCard";
import { loadClasses } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { useCodeActions } from "../shared/hooks/useCodeActions";
import { useNow } from "../shared/hooks/useNow";
import { usePlanRefresh } from "../shared/hooks/usePlanRefresh";
import { useAdminStore } from "../shared/store/adminStore";
import { classPasswordText, hostOf, storageText } from "../shared/utils/admin";
import { cn } from "../shared/utils/cn";

// Кнопки в шапці ПК: «Plan neu laden», «Neuer Editor-Code»
const DesktopActions = () => {
  const navigate = useNavigate();
  const refresh = usePlanRefresh();
  return (
    <div className="hidden gap-2.5 lg:flex">
      <Button className="flex-none px-5" disabled={refresh.busy} onClick={refresh.run}>
        <RenewIcon className={cn("size-4", refresh.busy && "animate-spin")} /> Plan neu laden
      </Button>
      <Button variant="primary" className="flex-none px-5" onClick={() => navigate("/admin/codes?neu=1")}>
        <Plus className="size-4.5" /> Neuer Editor-Code
      </Button>
    </div>
  );
};

// «Schnell» на телефоні: Protokoll, Passwörter (дата зміни пароля класу), сервер, Kurse & Fächer, Materialien
const QuickLinks = ({ overview, baseUrl, today }) => (
  <ListCard title="Schnell" className="lg:hidden">
    <MenuRow to="/admin/protokoll" icon={FileText} label="Protokoll" />
    <MenuRow to="/admin/passwoerter" icon={LockIcon} label="Passwörter" value={classPasswordText(overview.classPasswordChangedAt, today)?.ago} />
    <MenuRow to="/admin/einstellungen" icon={Server} label="Schule & Plan" value={hostOf(baseUrl)} />
    <MenuRow to="/admin/kurse" icon={Table2} label="Kurse & Fächer" />
    <MenuRow to="/admin/materialien" icon={Folder} label="Materialien" />
  </ListCard>
);

// Один і той самий порожній список: новий [] у селекторі Zustand щоразу — нескінченний перерендер
const NO_CODES = [];

// Таблиця кодів на ПК (ті самі дії, що на сторінці Editor-Codes)
const CodesPanel = ({ today }) => {
  const codes = useAdminStore((s) => s.codes.data?.codes ?? NO_CODES);
  const { toggle } = useCodeActions();
  const [action, setAction] = useState(null);
  return (
    <section className="hidden lg:block">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-hint font-extrabold text-faint">Editor-Codes</h2>
        <Link to="/admin/codes" className="text-label font-extrabold text-accent-ink">
          Alle
        </Link>
      </div>
      <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
        {codes.length ? (
          <CodeTable compact codes={codes} today={today} onToggle={toggle} onAction={(kind, code) => (kind === "lock" ? toggle(code) : setAction({ kind, code }))} />
        ) : (
          <p className="pb-4 text-body-sm text-muted">Noch keine Editor-Codes.</p>
        )}
      </div>
      <CodeDialogs action={action} onChange={setAction} />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// «Übersicht» (макети 40 телефон, 42 ПК): чи працює опит плану, числа, швидкі посилання, останні події.
// ─────────────────────────────────────────────────────────────
const AdminOverview = () => {
  const { today } = useNow();
  const overview = useAdminStore((s) => s.overview);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const logout = useAdminStore((s) => s.logout);
  const baseUrl = useAdminStore((s) => s.settings.data?.settings.school.baseUrl ?? null);
  const classes = useAdminLoad("classes", loadClasses); // «32 Klassen»

  // Адреса сервера школи — з налаштувань
  useEffect(() => {
    ensureSettings();
  }, [ensureSettings]);

  const logoutButton = (
    <button type="button" aria-label="Abmelden" onClick={logout} className="grid size-9.5 place-items-center rounded-full bg-card text-ink lg:hidden">
      <LogOut className="size-4.25" />
    </button>
  );

  const renderBody = () => {
    if (overview.status === "loading") return <AdminSkeleton rows={3} />;
    if (overview.status === "error") return <AdminError error={overview.error} onRetry={reloadOverview} />;
    const data = overview.data;
    return (
      <>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-[1.75fr_1fr_1fr_1fr] lg:gap-3.5">
          <div className="col-span-3 lg:col-span-1">
            <PlanHealthCard overview={data} baseUrl={baseUrl} classCount={classes.data?.classes?.length ?? null} withButton />
          </div>
          <CountTiles counts={data.counts} />
        </div>
        {data.storage && (
          <p className={cn("text-label", data.storage.diskLow ? "font-bold text-danger" : "text-faint")}>
            Speicher · {storageText(data.storage)}
            {data.storage.diskLow && " · Speicher wird knapp"}
          </p>
        )}
        <QuickLinks overview={data} baseUrl={baseUrl} today={today} />
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-6">
          <CodesPanel today={today} />
          <RecentEvents events={data.events ?? []} today={today} linkLabel={<><span className="lg:hidden">Alle</span><span className="hidden lg:inline">Protokoll</span></>} />
        </div>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Übersicht" accent actions={[<DesktopActions key="desk" />, <span key="out">{logoutButton}</span>]} />
      {renderBody()}
    </section>
  );
};

export default AdminOverview;
