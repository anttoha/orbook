import { useMemo } from "react";
import { useAdminStore } from "../store/adminStore";
import { adminClassList, pickAdminClass } from "../utils/adminClasses";

// Классы сервера для админки (часть 29c): весь список и тот, что сейчас настраивается.
// Пока /admin/schools не пришёл (или старый сервер без школ) — list пустой, current = null
export function useAdminClasses() {
  const schools = useAdminStore((s) => s.schools.data?.schools);
  const classId = useAdminStore((s) => s.classId);
  const list = useMemo(() => adminClassList(schools), [schools]);
  return { list, current: pickAdminClass(list, classId), schools: schools ?? [] };
}
