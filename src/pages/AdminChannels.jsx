import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import ChannelOptions from "../components/admin/channels/ChannelOptions";
import ConnectHero from "../components/admin/channels/ConnectHero";
import ConnectSheet from "../components/admin/channels/ConnectSheet";
import GroupStatus from "../components/admin/channels/GroupStatus";
import MessagePreview from "../components/admin/channels/MessagePreview";
import RecentList from "../components/admin/channels/RecentList";
import ShareTextSheet from "../components/admin/channels/ShareTextSheet";
import WhatsappCard from "../components/admin/channels/WhatsappCard";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { loadChannels, saveSettings, telegramDisconnect, telegramTest } from "../shared/api/admin";
import { useAdminStore } from "../shared/store/adminStore";

// Настройки по умолчанию, пока /admin/settings не ответил (как на сервере)
const DEFAULTS = { plan: true, tomorrow: true, exam: false, minutesAfter: 30 };

// ─────────────────────────────────────────────────────────────
// «Admin → Kanäle» (часть 27): ORBook пишет в Telegram-группу класса.
// Статус группы — GET /admin/channels; что слать — обычные настройки channels.*
// ─────────────────────────────────────────────────────────────
const AdminChannels = () => {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [open, setOpen] = useState(null); // "connect" | "share" | "disconnect"
  const [busy, setBusy] = useState(false);
  const settings = useAdminStore((s) => s.settings.data?.settings?.channels);
  const reloadSettings = useAdminStore((s) => s.reloadSettings);
  const [values, setValues] = useState(null); // переключатели сразу, не дожидаясь сервера

  const reload = useCallback(() => {
    loadChannels()
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((error) => setState({ status: "error", data: null, error }));
  }, []);

  useEffect(() => {
    reload();
    reloadSettings();
  }, [reload, reloadSettings]);

  const current = values ?? settings ?? DEFAULTS;

  const change = async (key, value) => {
    const before = current;
    setValues({ ...current, [key]: value });
    try {
      await saveSettings({ channels: { [key]: value } });
      reloadSettings();
      if (key === "minutesAfter") reload(); // «Heute um …» считает сервер
    } catch (error) {
      setValues(before);
      toast.error(error.message);
    }
  };

  const test = async () => {
    setBusy(true);
    try {
      const { ok } = await telegramTest();
      if (ok) toast.success("Test gesendet");
      else toast.error("Nicht angekommen – bitte neu verbinden");
      reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await telegramDisconnect();
      setOpen(null);
      toast.success("Telegram getrennt");
      reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  // Подключилась группа (из шторки): сразу показать её, не дожидаясь закрытия
  const connected = useCallback((data) => setState({ status: "ready", data, error: null }), []);

  const renderBody = () => {
    if (state.status === "loading") return <AdminSkeleton rows={4} />;
    if (state.status === "error") return <AdminError error={state.error} onRetry={reload} />;
    const { group, botConfigured, tomorrowAt, recent } = state.data;
    return (
      // Телефон: одна колонка (колонки ПК — max-lg:contents), «Trennen» в самом низу (order-last)
      <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="flex flex-col gap-7 max-lg:contents lg:gap-5">
          {group ? (
            <GroupStatus group={group} busy={busy} onTest={test} onReconnect={() => setOpen("connect")} />
          ) : (
            <ConnectHero botConfigured={botConfigured} onConnect={() => setOpen("connect")} />
          )}
          <ChannelOptions values={current} tomorrowAt={tomorrowAt} onChange={change} dim={!group} />
          {group && (
            <Button className="flex-none bg-card text-danger max-lg:order-last lg:max-w-60" onClick={() => setOpen("disconnect")}>
              <X className="size-4" /> Telegram trennen
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-7 max-lg:contents lg:gap-5">
          <MessagePreview />
          <WhatsappCard onShare={() => setOpen("share")} />
          <RecentList items={recent} />
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="Kanäle" backTo="/admin/einstellungen" />
      {renderBody()}
      <ConnectSheet open={open === "connect"} onClose={() => setOpen(null)} onConnected={connected} />
      <ShareTextSheet open={open === "share"} onClose={() => setOpen(null)} />
      <ConfirmDialog
        open={open === "disconnect"}
        onClose={() => setOpen(null)}
        icon={<X className="size-6.5 text-danger" />}
        title="Telegram trennen?"
        text={`Der Bot verlässt „${state.data?.group?.title ?? "die Gruppe"}“.`}
      >
        <Button onClick={() => setOpen(null)}>Abbrechen</Button>
        <Button variant="danger" onClick={disconnect} disabled={busy}>
          Trennen
        </Button>
      </ConfirmDialog>
    </section>
  );
};

export default AdminChannels;
