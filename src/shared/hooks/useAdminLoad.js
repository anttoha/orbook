import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Завантаження для одного екрана адмінки (Klausuren, Protokoll, Kurse).
// key — рядок умов (вкладка, пошук): змінився — запит іде знову.
// load() повертає проміс з даними. Результат: { status, data, error, reload }
//   status: "loading" (перший запит) | "ready" | "error"
// Поки йде новий запит, старі дані лишаються на екрані (не блимає).
// ─────────────────────────────────────────────────────────────
export function useAdminLoad(key, load) {
  const [attempt, setAttempt] = useState(0); // «Erneut versuchen» / після зміни — збільшуємо
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const fullKey = `${key}|${attempt}`;

  useEffect(() => {
    let active = true; // екран закрили або умови змінились: стару відповідь не показуємо
    load().then(
      (data) => active && setResult({ key: fullKey, data, error: null }),
      (error) => active && setResult((prev) => ({ key: fullKey, data: prev.data, error })),
    );
    return () => {
      active = false;
    };
    // load — нова функція на кожен рендер; умови запиту вже є в fullKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  const reload = () => setAttempt((n) => n + 1);
  const fresh = result.key === fullKey;
  let status = "ready";
  if (!fresh && !result.data) status = "loading";
  else if (fresh && result.error && !result.data) status = "error";
  return { status, data: result.data, error: fresh ? result.error : null, reload };
}
