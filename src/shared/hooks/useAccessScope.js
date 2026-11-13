import { createContext, useContext } from "react";
import { adminAccess } from "../api/admin";
import { useAdminStore } from "../store/adminStore";

// ─────────────────────────────────────────────────────────────
// Чьи Zugangscodes показывают окна «Zugangscodes» (часть 29c).
// По умолчанию — админка (/admin/access-codes, список в adminStore).
// «Klasse verwalten» в Mehr кладёт сюда свой набор: /class/access-codes, только свой класс.
//   { api, access: { status, data, error }, reload, yearEnd, className, admin }
// ─────────────────────────────────────────────────────────────
export const AccessScope = createContext(null);

export function useAccessScope() {
  const classScope = useContext(AccessScope);
  const access = useAdminStore((s) => s.access);
  const reload = useAdminStore((s) => s.reloadAccess);
  const yearEnd = useAdminStore((s) => s.settings.data?.settings.school.yearEnd ?? null);
  const className = useAdminStore((s) => s.settings.data?.settings.school.className ?? null);
  return classScope ?? { api: adminAccess, access, reload, yearEnd, className, admin: true };
}
