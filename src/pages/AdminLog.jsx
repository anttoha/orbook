import { useEffect, useState } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminNote, AdminSkeleton } from "../components/admin/AdminState";
import EventList from "../components/admin/EventList";
import SearchField from "../components/admin/SearchField";
import Segmented from "../components/ui/Segmented";
import { loadEvents } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { useDebounced } from "../shared/hooks/useDebounced";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";

const FILTERS = [
  { value: "all", label: "Alles" },
  { value: "plan", label: "Plan" },
  { value: "error", label: "Fehler" }, // сервер додає всі записи з level = err
  { value: "code", label: "Codes" },
];

// ─────────────────────────────────────────────────────────────
// «Protokoll» (макети 46 телефон, 49 ПК). Нові згори, по 50; «Mehr laden» — наступна сторінка (before).
// ─────────────────────────────────────────────────────────────
const AdminLog = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { today } = useNow();
  const ensureSettings = useAdminStore((s) => s.ensureSettings);
  const keepDays = useAdminStore((s) => s.settings.data?.settings.logs.retentionDays ?? 30);
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const q = useDebounced(query); // запит — коли перестали друкувати
  const key = `${kind}|${q}`;
  const first = useAdminLoad(key, () => loadEvents({ kind, q }));
  const [more, setMore] = useState({ key: null, events: [], nextBefore: null, busy: false }); // наступні сторінки

  // Скільки днів зберігається протокол — з налаштувань
  useEffect(() => {
    ensureSettings();
  }, [ensureSettings]);

  // Інший фільтр або пошук — догружені сторінки вже не про те: починаємо з першої
  const extra = more.key === key ? more : { events: [], nextBefore: first.data?.nextBefore ?? null, busy: false };
  const events = [...(first.data?.events ?? []), ...extra.events];

  const loadMore = async () => {
    setMore({ ...extra, key, busy: true });
    try {
      const page = await loadEvents({ kind, q, before: extra.nextBefore });
      setMore({ key, events: [...extra.events, ...page.events], nextBefore: page.nextBefore, busy: false });
    } catch {
      setMore({ ...extra, key, busy: false });
    }
  };

  const renderList = () => {
    if (first.status === "loading") return <AdminSkeleton rows={6} />;
    if (first.status === "error") return <AdminError error={first.error} onRetry={first.reload} />;
    if (!events.length) return <AdminEmpty text="Keine Einträge" />;
    return <EventList isDesktop={isDesktop} events={events} today={today} />;
  };

  const filters = <Segmented label="Filter" size="form" className="lg:w-auto" value={kind} onChange={setKind} options={FILTERS} />;

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Protokoll" backTo="/admin" actions={isDesktop && [<span key="f">{filters}</span>, <SearchField key="s" value={query} onChange={setQuery} className="w-50" />]} />
      {!isDesktop && filters}
      <div>{renderList()}</div>
      {extra.nextBefore && first.status === "ready" && (
        <button type="button" disabled={extra.busy} onClick={loadMore} className="mx-auto h-10.5 rounded-full bg-sand px-5 text-label font-extrabold text-ink disabled:opacity-50">
          {extra.busy ? "Wird geladen…" : "Mehr laden"}
        </button>
      )}
      <AdminNote>Im Protokoll stehen keine IP-Adressen und keine Namen. Einträge älter als {keepDays} Tage werden gelöscht.</AdminNote>
    </section>
  );
};

export default AdminLog;
