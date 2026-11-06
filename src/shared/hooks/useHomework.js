import { useEffect, useState } from "react";
import { api } from "../api/api";
import { loadHistory } from "../api/homework";
import { usePlanStore } from "../store/planStore";
import { isExamId } from "../utils/exams";

// Одна Hausaufgabe за номером з адреси: { item, status }, як useExam.
// Зазвичай вона вже є у списку. Запит — коли вікно відкрили за посиланням або на минулий день
export const useHomeworkItem = (id) => {
  const known = usePlanStore((s) => s.homework.find((item) => String(item.id) === id)) ?? null;
  const [fetched, setFetched] = useState({ id: null, item: null, error: null });
  const valid = isExamId(id); // той самий формат номера
  const needed = valid && !known;

  useEffect(() => {
    if (!needed) return undefined;
    const controller = new AbortController(); // вікно закрили — відповідь уже не потрібна
    api(`/homework/${id}`, { signal: controller.signal })
      .then((item) => setFetched({ id, item, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setFetched({ id, item: null, error });
      });
    return () => controller.abort();
  }, [id, needed]);

  if (known) return { item: known, status: "ready" };
  if (!valid) return { item: null, status: "missing" };
  if (fetched.id !== id) return { item: null, status: "loading" };
  if (fetched.item) return { item: fetched.item, status: "ready" };
  return { item: null, status: fetched.error?.status === 404 ? "missing" : "error", error: fetched.error };
};

// «Verlauf» запису: kind — "homework" | "exams". version — щоб після зміни запис перечитався.
// enabled = false — нічого не питаємо (запис ще не змінювали)
export const useHistory = (kind, id, version, enabled) => {
  const [state, setState] = useState({ key: null, changes: [], error: null });
  const key = `${kind}/${id}/${version}`;

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    loadHistory(kind, id, controller.signal)
      .then((data) => setState({ key, changes: data?.changes ?? [], error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ key, changes: [], error });
      });
    return () => controller.abort();
  }, [kind, id, key, enabled]);

  if (!enabled) return { status: "off", changes: [] };
  if (state.key !== key) return { status: "loading", changes: [] };
  return { status: state.error ? "error" : "ready", changes: state.changes, error: state.error };
};

// Hausaufgaben з терміном date (блок «fällig heute» у дні, макет handy-07).
// Від сьогодні вони вже є у списку planStore; для минулих днів — окремий запит from=to=date.
// homeworkStamp — після запису/видалення перечитуємо
export const useHomeworkDue = (date, today) => {
  const all = usePlanStore((s) => s.homework);
  const stamp = usePlanStore((s) => s.homeworkStamp);
  const fromStore = date >= today;
  const [past, setPast] = useState({ key: null, items: [] });
  const key = `${date}/${stamp}`;

  useEffect(() => {
    if (fromStore || !date) return undefined;
    const controller = new AbortController();
    api(`/homework?from=${date}&to=${date}`, { signal: controller.signal })
      .then((data) => setPast({ key, items: data?.homework ?? [] }))
      .catch(() => {
        if (!controller.signal.aborted) setPast({ key, items: [] }); // без мережі блоку просто немає
      });
    return () => controller.abort();
  }, [date, fromStore, key]);

  if (fromStore) return all.filter((item) => item.due === date);
  return past.key === key ? past.items : [];
};
