import { useEffect, useState } from "react";

// Текущее время (Date.now()), пока active — обновляется каждые ms (Lerntimer, часть 44).
// Таймер считает от времени старта, поэтому пропущенный тик (вкладка в фоне) ничего не ломает
export function useTicker(active, ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id); // остановили таймер или ушли со страницы
  }, [active, ms]);
  return now;
}
