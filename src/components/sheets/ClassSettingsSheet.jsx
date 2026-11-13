import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNavigate } from "react-router-dom";
import { Bell, Pencil, Table2 } from "lucide-react";
import { cache } from "../../shared/api/offlineCache";
import { CLASS_COLORS } from "../../shared/constants/classColors";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { usePushStore } from "../../shared/store/pushStore";
import { useUserStore } from "../../shared/store/userStore";
import { classPrefs, classSubtitle } from "../../shared/utils/classes";
import { cn } from "../../shared/utils/cn";
import { courseCount } from "../../shared/utils/courses";
import { prefsSummary } from "../../shared/utils/push";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import MenuRow from "../more/MenuRow";
import SettingRow from "../more/SettingRow";
import Sheet from "../ui/Sheet";
import Switch from "../ui/Switch";
import { CheckIcon, KeyIcon, TrashIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// «Klasse einstellen» (макет 29 handy-07). Адрес: ?sheet=klasse&id=2
// Имя, цвет и «Beim Start öffnen» — только на устройстве. Meine Kurse, Mitteilungen и Editor-Code —
// обычные страницы: сначала открываем этот класс, потом страницу.
// ─────────────────────────────────────────────────────────────
const ClassSettingsSheet = ({ open, onClose, sheet }) => {
  const t = useT();
  const id = Number(sheet.id);
  const item = useClasses((s) => s.list.find((c) => c.id === id));
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={item ? classSubtitle(item) : ""} title={t("Klasse einstellen")}>
      {item ? <ClassSettings item={item} onClose={onClose} /> : <p className="text-body-sm text-muted">{t("Diese Klasse ist nicht mehr auf dem Gerät.")}</p>}
    </Sheet>
  );
};

const ClassSettings = ({ item, onClose }) => {
  const t = useT();
  const navigate = useNavigate();
  const update = useClasses((s) => s.update);
  const setStartOpen = useClasses((s) => s.setStartOpen);
  const openClass = usePlanStore((s) => s.openClass);
  const values = useClassValues(item);

  // Страница класса: сначала класс, потом страница (её данные грузятся уже для него)
  const go = (path) => {
    onClose();
    navigate(path);
    openClass(item.id);
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        <li className="flex h-14 items-center gap-3">
          <label htmlFor="class-label" className="text-row text-ink">
            {t("Name")}
          </label>
          <input id="class-label" value={item.label} onChange={(e) => update(item.id, { label: e.target.value })} maxLength={30} placeholder={`${t("Klasse")} ${item.name}`} className="min-w-0 flex-1 bg-transparent text-right text-row font-extrabold text-ink outline-none placeholder:font-normal placeholder:text-faint" />
          <Pencil className="size-4 shrink-0 text-faint" />
        </li>
        <li className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3">
          <span className="text-row text-ink">{t("Farbe")}</span>
          <ColorChoice value={item.color} onPick={(color) => update(item.id, { color })} />
        </li>
      </ul>

      <ul className="rounded-card bg-card px-3.5 py-0.5">
        <MenuRow onClick={() => go("/mehr/kurse")} icon={Table2} label="Meine Kurse" value={values.courses} />
        <MenuRow onClick={() => go("/mehr/mitteilungen")} icon={Bell} label="Mitteilungen" value={values.push} />
        <MenuRow onClick={() => go("/mehr/editor-code")} icon={KeyIcon} label="Tests eintragen" value={item.canEdit ? "aktiv" : "Editor-Code"} />
      </ul>

      <ul className="rounded-card bg-card px-3.5">
        <SettingRow label="Beim Start öffnen" hint="Gleich diese Klasse statt „Meine Klassen“">
          <Switch checked={Boolean(item.startOpen)} onChange={(on) => setStartOpen(item.id, on)} label="Beim Start öffnen" />
        </SettingRow>
      </ul>

      <RemoveClass item={item} onDone={onClose} />
      <p className="text-caption text-faint">{t("Nur auf diesem Gerät. Der Zugangscode bleibt gültig.")}</p>
    </div>
  );
};

// «5 von 6» и «nur Ausfall» — у любого класса: курсы открытого класса уже в planStore,
// у остальных — из сохранённой копии (карточка «Meine Klassen» её только что загрузила)
function useClassValues(item) {
  const t = useT();
  const activeId = useClasses((s) => s.activeId);
  const isActive = item.id === activeId;
  const loaded = usePlanStore((s) => s.courses);
  const prefs = useUserStore(useShallow((s) => classPrefs(s, item.id, activeId)));
  const push = usePushStore(useShallow((s) => {
    const own = s.classSettings(item.id, activeId);
    return { enabled: own.enabled, prefs: own.prefs };
  }));
  const courses = isActive ? loaded : (cache.load("courses", item.id)?.data?.courses ?? []);
  const count = courseCount(courses, prefs.picked, prefs.hiddenRequired);
  return { courses: count.all > 0 ? `${count.on} ${t("von")} ${count.all}` : null, push: prefsSummary(push.enabled, push.prefs) };
}

// Кружочки цвета класса (те же токены, что у Fachfarben)
const ColorChoice = ({ value, onPick }) => {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(CLASS_COLORS).map(([key, color]) => (
        <button key={key} type="button" aria-label={t(color.label)} aria-pressed={key === value} onClick={() => onPick(key)} className={cn("grid size-7 place-items-center rounded-full text-white ring-offset-2 ring-offset-card", color.solid, key === value ? "ring-2 ring-ink" : "ring-0")}>
          {key === value && <CheckIcon className="size-3.5" />}
        </button>
      ))}
    </div>
  );
};

// «Klasse entfernen» и диалог как «Klasse verlassen» (Soft 28)
const RemoveClass = ({ item, onDone }) => {
  const t = useT();
  const navigate = useNavigate();
  const leaveClass = usePlanStore((s) => s.leaveClass);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const wasLast = useClasses.getState().list.length <= 1;
      await leaveClass(item.id);
      setOpen(false);
      onDone();
      navigate(wasLast ? "/" : "/klassen", { replace: true });
    } catch (e) {
      setError(e.status === 0 ? t("Dafür brauchst du Internet.") : e.message);
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-14 w-full items-center gap-3.25 rounded-card bg-card px-3.5 text-danger">
        <TrashIcon className="size-4.5 shrink-0" />
        <span className="text-row font-medium">{t("Klasse entfernen")}</span>
      </button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} icon={<TrashIcon className="size-6.5 text-danger" />} title={t("Klasse entfernen?")} text={error ?? t("Nur auf diesem Gerät. Der Zugangscode bleibt gültig.")}>
        <Button onClick={() => setOpen(false)}>{t("Bleiben")}</Button>
        <Button variant="danger" onClick={remove} disabled={busy}>
          <TrashIcon className="size-4" /> {t("Entfernen")}
        </Button>
      </ConfirmDialog>
    </>
  );
};

export default ClassSettingsSheet;
