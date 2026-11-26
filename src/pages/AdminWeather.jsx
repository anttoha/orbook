import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import PlaceList from "../components/admin/weather/PlaceList";
import Button from "../components/ui/Button";
import ErrorText from "../components/ui/ErrorText";
import Liquid from "../components/ui/Liquid";
import RowSwitch from "../components/ui/RowSwitch";
import TextField from "../components/ui/TextField";
import WeatherCard from "../components/weather/WeatherCard";
import { saveSettings } from "../shared/api/admin";
import { previewWeather, searchPlaces } from "../shared/api/weather";
import { useDebounced } from "../shared/hooks/useDebounced";
import { useT } from "../shared/hooks/useT";
import { useAdminStore } from "../shared/store/adminStore";
import { samePlace } from "../shared/utils/weather";

// ─────────────────────────────────────────────────────────────
// «Admin → Einstellungen → Wetter» (макет 50 handy-07, часть 50a).
// Вкл/выкл для всей школы и место школы: поиск города (Open-Meteo через наш сервер) →
// выбрать → «Vorschau · heute» → «Speichern» (PATCH settings.weather).
// ─────────────────────────────────────────────────────────────
const WeatherForm = ({ saved, onSaved }) => {
  const t = useT();
  const [enabled, setEnabled] = useState(saved.enabled);
  const [place, setPlace] = useState(saved.place);
  const [query, setQuery] = useState(saved.place?.name ?? "");
  const [found, setFound] = useState({ q: "", places: saved.place ? [saved.place] : [], error: null });
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounced(query.trim(), 400);
  const dirty = enabled !== saved.enabled || !samePlace(place, saved.place);

  // Поиск: с 2 букв, когда перестали печатать. Своё сохранённое имя не ищем заново
  useEffect(() => {
    if (q.length < 2 || q === saved.place?.name) return undefined;
    const ctrl = new AbortController();
    searchPlaces(q, ctrl.signal)
      .then((places) => setFound({ q, places, error: null }))
      .catch((error) => !ctrl.signal.aborted && setFound({ q, places: [], error }));
    return () => ctrl.abort();
  }, [q, saved.place?.name]);

  // Превью выбранного места
  useEffect(() => {
    if (!place) return undefined;
    const ctrl = new AbortController();
    previewWeather(place, ctrl.signal)
      .then(setPreview)
      .catch(() => !ctrl.signal.aborted && setPreview(null)); // нет превью — просто не показываем
    return () => ctrl.abort();
  }, [place]);

  const save = async () => {
    setBusy(true);
    try {
      await saveSettings({ weather: { enabled, place } });
      toast.success(t("Gespeichert"));
      onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const nothing = found.q && found.q === q && !found.error && found.places.length === 0;

  return (
    <div className="flex flex-col gap-6 lg:max-w-xl">
      <Liquid as="div" refract press={false} className="rounded-card bg-card">
        <RowSwitch checked={enabled} onToggle={() => setEnabled(!enabled)} label={t("Wetter anzeigen")} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-body text-ink">
          <span>{t("Wetter anzeigen")}</span>
        </RowSwitch>
      </Liquid>

      <div className="flex flex-col gap-3">
        <TextField id="weather-place" label={t("Ort der Schule")} value={query} autoComplete="off" leading={<Search className="size-4.5" />} onChange={(event) => setQuery(event.target.value)} />
        {nothing && <ErrorText>{t("Kein Ort gefunden.")}</ErrorText>}
        {found.error && <ErrorText>{found.error.message}</ErrorText>}
        {found.places.length > 0 && <PlaceList places={found.places} selected={place} onPick={setPlace} />}
      </div>

      {place && preview && (
        <section className="flex flex-col gap-3">
          <h2 className="text-hint font-extrabold text-faint">{t("Vorschau · heute")}</h2>
          <WeatherCard date={preview.days?.[0]?.date} weather={preview} onOpen={() => {}} />
        </section>
      )}

      <Button variant={dirty ? "primary" : "secondary"} className="flex-none" disabled={!dirty || busy || (enabled && !place)} onClick={save}>
        <Check className="size-4.5" /> {dirty ? t("Speichern") : t("Gespeichert")}
      </Button>
    </div>
  );
};

const AdminWeather = () => {
  const t = useT();
  const settings = useAdminStore((s) => s.settings);
  const reloadSettings = useAdminStore((s) => s.reloadSettings);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  const weather = settings.data?.settings?.weather ?? { enabled: false, place: null };
  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title={t("Wetter")} backTo="/admin/einstellungen" />
      {settings.status === "error" ? (
        <AdminError error={settings.error} onRetry={reloadSettings} />
      ) : !settings.data ? (
        <AdminSkeleton rows={3} />
      ) : (
        <WeatherForm key={JSON.stringify(weather)} saved={weather} onSaved={reloadSettings} />
      )}
    </section>
  );
};

export default AdminWeather;
