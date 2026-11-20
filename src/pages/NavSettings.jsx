import { useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw } from "lucide-react";
import GroupSheet from "../components/leiste/GroupSheet";
import LeistePreview from "../components/leiste/LeistePreview";
import NavEditor from "../components/leiste/NavEditor";
import SettingRow from "../components/more/SettingRow";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import PillButton from "../components/ui/PillButton";
import Segmented from "../components/ui/Segmented";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { addGroup, addToNav, dissolveGroup, isGroup, LIMITS, menuStyleOf, navOf, placesUsed, removeFromNav, updateGroup } from "../shared/utils/navLayout";

const DEVICES = [
  { value: "pc", get label() { return translate("Computer"); } },
  { value: "phone", get label() { return translate("Handy"); } },
];
const LOOKS = [
  { value: "kompakt", get label() { return translate("Kompakt"); } },
  { value: "gross", get label() { return translate("Groß"); } },
];
// Почему перенос не получился (navLayout.moveItem / addToNav)
const ERRORS = {
  phone: { voll: "Unten ist voll – zieh es in eine Gruppe" },
  pc: { voll: "Im Menü ist kein Platz mehr – zieh es in eine Gruppe" },
  "gruppe-voll": "In einer Gruppe sind höchstens 6",
  nein: "Eine Gruppe passt nicht in eine Gruppe",
};

// ─────────────────────────────────────────────────────────────
// «Darstellung → Untere Leiste» (часть 35, макеты handy-03…07, pc-02). Всё живёт в userStore.nav и едет в Sync.
// Телефон правит свою панель; на ПК сверху переключатель «Computer | Handy» — у ПК своё боковое меню (места больше).
// ─────────────────────────────────────────────────────────────
const NavSettings = () => {
  const t = useT();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [picked, setPicked] = useState(null); // выбор «Computer | Handy» (null — по устройству)
  const device = picked ?? (isDesktop ? "pc" : "phone");
  const features = usePlanStore((s) => s.me?.features);
  const nav = useUserStore((s) => s.nav);
  const setNav = useUserStore((s) => s.setNav);
  const setNavMenu = useUserStore((s) => s.setNavMenu);
  const list = navOf(nav, device);
  const [editing, setEditing] = useState(null); // id группы в шторке
  const group = list.find((item) => isGroup(item) && item.id === editing) ?? null;

  const save = (next) => setNav(device, next);
  const fail = (error) => toast(t(ERRORS[device][error] ?? ERRORS[error]));
  const full = { on: list.length >= LIMITS[device], label: device === "phone" ? `${placesUsed(list)} ${t("von")} ${LIMITS.phone + 1}` : null };

  const add = (key) => {
    const r = addToNav(list, key, device);
    if (r.error) fail(r.error);
    else save(r.list);
  };
  const newGroup = () => {
    const r = addGroup(list, device);
    if (r.error) return fail(r.error);
    save(r.list);
    setEditing(r.id);
  };
  // Распустить группу — разделы уходят в «Mehr»; «Rückgängig» возвращает как было
  const dissolve = () => {
    const before = list;
    save(dissolveGroup(list, editing));
    setEditing(null);
    toast(t("Gruppe aufgelöst"), { duration: 6000, action: { label: t("Rückgängig"), onClick: () => setNav(device, before) } });
  };
  const reset = () => {
    const before = nav?.[device] ?? null;
    setNav(device, null);
    toast(t("Zurückgesetzt"), { duration: 6000, action: { label: t("Rückgängig"), onClick: () => setNav(device, before) } });
  };

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <PageHeader backTo="/mehr/darstellung" eyebrow={t("Darstellung")} title={t(device === "pc" ? "Seitenleiste" : "Untere Leiste")} subpage />

      {isDesktop && <Segmented label={t("Gerät")} size="form" className="w-fit" options={DEVICES} value={device} onChange={setPicked} />}
      {device === "phone" && <LeistePreview list={list} features={features} />}

      <NavEditor
        list={list}
        features={features}
        device={device}
        full={full}
        onChange={save}
        onError={fail}
        onAdd={add}
        onRemove={(key) => save(removeFromNav(list, key))}
        onEditGroup={setEditing}
        middle={
          <div className="flex flex-col gap-4.5">
            <PillButton glass="glass" size="lg" onClick={newGroup} className="flex h-11.5 items-center justify-center gap-2 rounded-full bg-sand text-row font-bold text-ink transition-opacity active:opacity-80">
              <Plus className="size-4" />
              {t("Gruppe hinzufügen")}
            </PillButton>
            {device === "phone" && (
              <ListCard>
                <SettingRow label={t("Gruppenmenü")}>
                  <Segmented label={t("Gruppenmenü")} size="form" className="w-fit" options={LOOKS} value={menuStyleOf(nav)} onChange={setNavMenu} />
                </SettingRow>
              </ListCard>
            )}
          </div>
        }
      />

      <PillButton glass="glass" size="lg" onClick={reset} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sand text-row font-bold text-ink transition-opacity active:opacity-80">
        <RotateCcw className="size-4" />
        {t("Zurücksetzen")}
      </PillButton>

      <GroupSheet
        group={group}
        features={features}
        onClose={() => setEditing(null)}
        onChange={(patch) => save(updateGroup(list, editing, patch))}
        onRemoveItem={(key) => save(removeFromNav(list, key))}
        onDissolve={dissolve}
      />
    </section>
  );
};

export default NavSettings;
