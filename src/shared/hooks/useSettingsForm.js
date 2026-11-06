import { useState } from "react";
import { toast } from "sonner";
import { saveSettings } from "../api/admin";
import { useAdminStore } from "../store/adminStore";
import { invalidKeys, settingsPatch } from "../utils/admin";

// ─────────────────────────────────────────────────────────────
// Чернетка налаштувань адміна: правки копляться тут, «Änderungen speichern» шле тільки змінене.
// Сервер приймає все або нічого: одне погане значення → 422, і ми підсвічуємо саме ці поля (bad).
//   initial — settings з GET /admin/settings
// ─────────────────────────────────────────────────────────────
export function useSettingsForm(initial) {
  const reloadSettings = useAdminStore((s) => s.reloadSettings);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const [form, setForm] = useState(initial);
  const [schoolPassword, setSchoolPassword] = useState(""); // лише на запис; порожнє не шлемо
  const [bad, setBad] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const patch = settingsPatch(initial, form);
  const dirty = Object.keys(patch).length > 0 || Boolean(schoolPassword);

  // Змінити одне поле: set("plan", "pollMinutes", 10). Його стара помилка вже нічого не означає
  const set = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setBad((prev) => new Set([...prev].filter((key) => key !== `${section}.${field}`)));
  };

  const save = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    try {
      await saveSettings(patch, schoolPassword);
      toast.success("Änderungen gespeichert");
      setSchoolPassword("");
      reloadSettings(); // нові дані → сторінка покаже свіжу форму
      reloadOverview();
    } catch (error) {
      setBad(new Set(invalidKeys(error)));
      toast.error(error.status === 422 ? "Nichts gespeichert: ein Wert ist nicht erlaubt." : error.message);
    } finally {
      setBusy(false);
    }
  };

  return { form, set, schoolPassword, setSchoolPassword, bad, busy, dirty, save };
}
