import { useEffect, useState } from "react";
import { api } from "../api/api";

// GET /api/public/info — те, що можна знати без входу: назва класу, контакт для Datenschutz.
// Поки немає відповіді (або немає мережі) — null: екрани показують текст без цих даних.
export const usePublicInfo = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // екран закрили — запит більше не потрібен
    api("/public/info", { signal: controller.signal })
      .then(setInfo)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return info;
};
