import { toast } from "sonner";
import * as admin from "../api/admin";
import { useAdminStore } from "../store/adminStore";

// ─────────────────────────────────────────────────────────────
// Дії з Editor-Codes (Code-Aktionen). Кожна: запит → оновити список і огляд → сповіщення.
// code.classId — клас коду (у списку коди всіх класів): запит іде від його імені.
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
    toggle: (code) => run(() => admin.updateCode(code.id, { active: !code.active }, code.classId), code.active ? `${code.label} gesperrt` : `${code.label} entsperrt`),
    rename: (code, label) => run(() => admin.updateCode(code.id, { label: label.trim() }, code.classId), "Umbenannt"),
    setRights: (code, rights) => run(() => admin.updateCode(code.id, { rights }, code.classId), "Rechte geändert"),
    setValidUntil: (code, validUntil) => run(() => admin.updateCode(code.id, { validUntil }, code.classId), "Gültigkeit geändert"),
    regenerate: (code) => run(() => admin.regenerateCode(code.id, code.classId)), // → { code, item }: показати новий код
    remove: (code) => run(() => admin.deleteCode(code.id, code.classId), `${code.label} gelöscht`),
  };
}
