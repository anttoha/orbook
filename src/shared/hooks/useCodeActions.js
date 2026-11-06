import { toast } from "sonner";
import * as admin from "../api/admin";
import { useAdminStore } from "../store/adminStore";

// ─────────────────────────────────────────────────────────────
// Дії з Editor-Codes (Code-Aktionen). Кожна: запит → оновити список і огляд → сповіщення.
// Повертає true, якщо вдалося (тоді вікно можна закрити), інакше показує помилку сервера і false.
// ─────────────────────────────────────────────────────────────
export function useCodeActions() {
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);

  const run = async (request, message) => {
    try {
      const result = await request();
      reloadCodes();
      reloadOverview(); // лічильник «Editor-Codes aktiv»
      if (message) toast.success(message);
      return result ?? true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  return {
    toggle: (code) => run(() => admin.updateCode(code.id, { active: !code.active }), code.active ? `${code.label} gesperrt` : `${code.label} entsperrt`),
    rename: (code, label) => run(() => admin.updateCode(code.id, { label: label.trim() }), "Umbenannt"),
    setRights: (code, rights) => run(() => admin.updateCode(code.id, { rights }), "Rechte geändert"),
    setValidUntil: (code, validUntil) => run(() => admin.updateCode(code.id, { validUntil }), "Gültigkeit geändert"),
    regenerate: (code) => run(() => admin.regenerateCode(code.id)), // → { code, item }: показати новий код
    remove: (code) => run(() => admin.deleteCode(code.id), `${code.label} gelöscht`),
  };
}
