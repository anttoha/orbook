import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminNote, AdminSkeleton } from "../components/admin/AdminState";
import CodeCard from "../components/admin/CodeCard";
import CodeDialogs from "../components/admin/CodeDialogs";
import CodeTable from "../components/admin/CodeTable";
import NewCodeSheet from "../components/admin/NewCodeSheet";
import SearchField from "../components/admin/SearchField";
import Button from "../components/ui/Button";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useCodeActions } from "../shared/hooks/useCodeActions";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";

// Пошук на ПК: за назвою або хвостом коду
const matches = (code, query) => `${code.label} ${code.masked}`.toLowerCase().includes(query.trim().toLowerCase());

// ─────────────────────────────────────────────────────────────
// «Editor-Codes» (макети 41 телефон, 43 ПК). ?neu=1 у адресі одразу відкриває вікно нового коду
// (так працює кнопка «Neuer Editor-Code» на Übersicht).
// ─────────────────────────────────────────────────────────────
const AdminCodes = () => {
  const { today } = useNow();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [params, setParams] = useSearchParams();
  const codes = useAdminStore((s) => s.codes);
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const { toggle } = useCodeActions();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null); // відкрите вікно дії: { kind, code }
  const newOpen = params.get("neu") === "1";

  // «Schuljahresende» у вікнах строку бере settings.school.yearEnd
  useEffect(() => {
    ensureSettings();
  }, [ensureSettings]);

  const openNew = () => setParams({ neu: "1" });
  const list = (codes.data?.codes ?? []).filter((code) => matches(code, query));

  const addButton = isDesktop ? (
    <Button variant="primary" className="flex-none px-5" onClick={openNew}>
      <Plus className="size-4.5" /> Neuer Code
    </Button>
  ) : (
    <button type="button" aria-label="Neuer Code" onClick={openNew} className="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent">
      <Plus className="size-5" />
    </button>
  );

  const renderList = () => {
    if (codes.status === "loading") return <AdminSkeleton />;
    if (codes.status === "error") return <AdminError error={codes.error} onRetry={reloadCodes} />;
    if (!codes.data.codes.length) {
      return (
        <AdminEmpty text="Noch keine Editor-Codes">
          <Button variant="primary" className="flex-none px-5" onClick={openNew}>
            <Plus className="size-4.5" /> Neuer Code
          </Button>
        </AdminEmpty>
      );
    }
    if (!list.length) return <AdminEmpty text="Kein Code passt zur Suche." />;
    if (!isDesktop) {
      return (
        <ul className="flex flex-col gap-2.5">
          {list.map((code) => (
            <CodeCard key={code.id} code={code} today={today} onToggle={toggle} onOpenSheet={() => setAction({ kind: "menu", code })} />
          ))}
        </ul>
      );
    }
    return (
      <>
        <div className="rounded-card bg-card px-5 pt-4.5 pb-1">
          <CodeTable codes={list} today={today} onToggle={toggle} onAction={(kind, code) => (kind === "lock" ? toggle(code) : setAction({ kind, code }))} />
        </div>
        <p className="mt-4 text-label text-faint">Codes werden nur als Hash gespeichert. Den vollen Code siehst du nur einmal — beim Erstellen.</p>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Editor-Codes" actions={[isDesktop && <SearchField key="search" value={query} onChange={setQuery} placeholder="Code suchen" className="w-50" />, <span key="add">{addButton}</span>]} />
      <AdminNote>Keine echten Namen als Bezeichnung — lieber »Code A« oder »Klassensprecher«.</AdminNote>
      <div>{renderList()}</div>

      <NewCodeSheet open={newOpen} onClose={() => setParams({}, { replace: true })} />
      <CodeDialogs action={action} onChange={setAction} />
    </section>
  );
};

export default AdminCodes;
