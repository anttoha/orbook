import { toast } from "sonner";
import * as admin from "../api/admin";
import { useAdminStore } from "../store/adminStore";
import { signedOutText } from "../utils/accessCodes";

// ─────────────────────────────────────────────────────────────
// Дії з Zugangscodes (частина 14c). Кожна: запит → оновити список → сповіщення
// «»Eltern« gesperrt · 9 Geräte abgemeldet». Повертає відповідь сервера або false (помилку показано).
// ─────────────────────────────────────────────────────────────
export function useAccessActions() {
  const reloadAccess = useAdminStore((s) => s.reloadAccess);

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
  const update = (code, changes, title) => run(() => admin.updateAccessCode(code.id, changes), title);

  return {
    toggle: (code) => update(code, { active: !code.active }, `${name(code)} ${code.active ? "gesperrt" : "entsperrt"}`),
    rename: (code, label) => update(code, { label: label.trim() }, "Umbenannt"),
    setLimit: (code, maxDevices) => update(code, { maxDevices }, "Geräte-Limit geändert"),
    setValidUntil: (code, validUntil) => update(code, { validUntil }, "Gültigkeit geändert"),
    signOut: (code) => run(() => admin.signOutAccessCode(code.id), name(code)),
    regenerate: (code) => run(() => admin.regenerateAccessCode(code.id)), // → { code, item, signedOut }: показати новий код
    remove: (code) => run(() => admin.deleteAccessCode(code.id), `${name(code)} gelöscht`),
    setPassword: (enabled) => run(() => admin.setClassPasswordEnabled(enabled), enabled ? "Klassenpasswort eingeschaltet" : "Klassenpasswort ausgeschaltet"),
    signOutPassword: () => run(() => admin.signOutClassPassword(), "Klassenpasswort"),
    // Посилання-запрошення (частина 16). Перше створюємо мовчки — людина просто відкрила «Einladen»
    createInvite: (code) => run(() => admin.renewInvite(code.id)),
    renewInvite: (code) => run(() => admin.renewInvite(code.id), "Neuer Link erstellt · der alte geht nicht mehr"),
    setInvite: (code, changes, title) => run(() => admin.updateInvite(code.id, changes), title),
  };
}
