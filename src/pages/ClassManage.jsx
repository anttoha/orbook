import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AccessDialogs from "../components/admin/access/AccessDialogs";
import AccessList from "../components/admin/access/AccessList";
import NewAccessSheet from "../components/admin/access/NewAccessSheet";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { classAccess } from "../shared/api/admin";
import { AccessScope } from "../shared/hooks/useAccessScope";
import { useAccessActions } from "../shared/hooks/useAccessActions";
import { useNow } from "../shared/hooks/useNow";
import { useInSettingsPanel } from "../shared/hooks/useSettingsPanel";
import { useT } from "../shared/hooks/useT";
import { useActiveClass } from "../shared/store/classesStore";
import { usePlanStore } from "../shared/store/planStore";
import { summaryText } from "../shared/utils/accessCodes";
import RoundButton from "../components/ui/RoundButton";

// Список кодов своего класса: { status, data, error }, как ресурс в adminStore
function useClassCodes() {
  const [access, setAccess] = useState({ status: "loading", data: null, error: null });
  const reload = useCallback(async () => {
    setAccess((old) => ({ ...old, status: old.data ? "ready" : "loading", error: null }));
    try {
      setAccess({ status: "ready", data: await classAccess.list(), error: null });
    } catch (error) {
      setAccess((old) => ({ ...old, status: old.data ? "ready" : "error", error }));
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { access, reload };
}

// Карточки кодов и окна действий (те же, что у админа: sperren, Einladen, Code anzeigen …)
const CodesBody = ({ access, reload, onNew }) => {
  const t = useT();
  const { today } = useNow();
  const actions = useAccessActions(); // берёт запросы из AccessScope выше — /class/access-codes
  const [action, setAction] = useState(null);
  if (access.status === "loading") return <AdminSkeleton rows={3} />;
  if (access.status === "error") return <AdminError error={access.error} onRetry={reload} />;

  const codes = access.data.codes ?? [];
  const toggle = (code) => (code.active ? setAction({ kind: "lock", code }) : actions.toggle(code));
  return (
    <>
      {codes.length > 0 ? (
        <>
          <p className="-mb-1.5 text-hint font-extrabold text-faint">{summaryText(codes, null)}</p>
          <AccessList codes={codes} password={null} today={today} onToggle={toggle} onMenu={(code) => setAction({ kind: "menu", code })} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <p className="text-dialog text-ink">{t("Noch keine Zugangscodes")}</p>
          <Button variant="primary" className="flex-none px-5" onClick={onNew}>
            <Plus className="size-4.5" /> {t("Ersten Code erstellen")}
          </Button>
        </div>
      )}
      <AccessDialogs action={action} password={null} onChange={setAction} onPasswordAction={() => {}} />
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Mehr → «Klasse verwalten» (часть 29, макет handy-19): учитель или староста с правом «Klasse verwalten»
// выдаёт Zugangscodes и приглашения своего класса — без админки. Те же карточки и окна, что у админа,
// только запросы идут в /api/class/access-codes (AccessScope), без Klassenpasswort и других классов.
// ─────────────────────────────────────────────────────────────
const ClassManage = () => {
  const t = useT();
  const inPanel = useInSettingsPanel();
  const me = usePlanStore((s) => s.me);
  const active = useActiveClass();
  const className = active?.name ?? me?.className ?? null;
  const { access, reload } = useClassCodes();
  const [creating, setCreating] = useState(false);
  const scope = useMemo(() => ({ api: classAccess, access, reload, yearEnd: null, className, admin: false }), [access, reload, className]);

  const addButton = inPanel ? (
    <Button variant="primary" className="flex-none self-start px-5" onClick={() => setCreating(true)}>
      <Plus className="size-4.5" /> {t("Neuer Code")}
    </Button>
  ) : (
    <RoundButton aria-label={t("Neuer Code")} onClick={() => setCreating(true)} look="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent">
      <Plus className="size-5" />
    </RoundButton>
  );

  return (
    <AccessScope.Provider value={scope}>
      <section className="flex flex-col gap-4">
        <PageHeader backTo="/mehr" eyebrow={className ? `${t("Mehr")} · ${t("Klasse")} ${className} ${t("verwalten")}` : "Mehr"} eyebrowClassName="text-accent-ink" title="Zugangscodes" panelTitle="Klasse verwalten" aside={me?.canManageClass && addButton} />
        {inPanel && me?.canManageClass && addButton}
        {me?.canManageClass ? (
          <>
            <CodesBody access={access} reload={reload} onNew={() => setCreating(true)} />
          </>
        ) : (
          <p className="rounded-card bg-card p-4 text-body-sm text-muted">{t("Dafür brauchst du das Recht „Klasse verwalten“. Es kommt mit einem Lehrer- oder Editor-Code.")}</p>
        )}
      </section>
      <NewAccessSheet open={creating} onClose={() => setCreating(false)} />
    </AccessScope.Provider>
  );
};

export default ClassManage;
