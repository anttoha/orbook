import { toast } from "sonner";
import * as admin from "../api/admin";
import { signedOutText } from "../utils/accessCodes";
import { useAccessScope } from "./useAccessScope";

// ─────────────────────────────────────────────────────────────
// Дії з Zugangscodes (частина 14c). Кожна: запит → оновити список → сповіщення
// «»Eltern« gesperrt · 9 Geräte abgemeldet». Повертає відповідь сервера або false (помилку показано).
// Запити — адміна або «Klasse verwalten» (useAccessScope).
// ─────────────────────────────────────────────────────────────
export function useAccessActions() {
  const { api, reload: reloadAccess } = useAccessScope();

  const run = async (request, title) => {
    try {
      const result = await request();
      reloadAccess();
      if (title) toast.success(signedOutText(title, result?.signedOut));
      return result ?? true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };
  const name = (code) => `»${code.label}«`;
  const update = (code, changes, title) => run(() => api.update(code.id, changes), title);

  return {
    toggle: (code) => update(code, { active: !code.active }, `${name(code)} ${code.active ? "gesperrt" : "entsperrt"}`),
    rename: (code, label) => update(code, { label: label.trim() }, "Umbenannt"),
    setLimit: (code, maxDevices) => update(code, { maxDevices }, "Geräte-Limit geändert"),
    setValidUntil: (code, validUntil) => update(code, { validUntil }, "Gültigkeit geändert"),
    signOut: (code) => run(() => api.signOut(code.id), name(code)),
    regenerate: (code) => run(() => api.regenerate(code.id)), // → { code, item, signedOut }: показати новий код
    remove: (code) => run(() => api.remove(code.id), `${name(code)} gelöscht`),
    setPassword: (enabled) => run(() => admin.setClassPasswordEnabled(enabled), enabled ? "Klassenpasswort eingeschaltet" : "Klassenpasswort ausgeschaltet"),
    signOutPassword: () => run(() => admin.signOutClassPassword(), "Klassenpasswort"),
    // Посилання-запрошення (частина 16). Перше створюємо мовчки — людина просто відкрила «Einladen»
    createInvite: (code) => run(() => api.renewInvite(code.id)),
    renewInvite: (code) => run(() => api.renewInvite(code.id), "Neuer Link erstellt · der alte geht nicht mehr"),
    setInvite: (code, changes, title) => run(() => api.updateInvite(code.id, changes), title),
  };
}
