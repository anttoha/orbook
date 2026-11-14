import { useEffect, useState } from "react";
import { getAdminPush } from "../../../shared/api/push";
import { lastSentLabel } from "../../../shared/utils/push";

// Под «Mitteilungen» в админке: сколько устройств подписано (только число) и что недавно уходило.
// Какие это устройства, админ не видит — сервер их и не называет
const PushStats = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    getAdminPush()
      .then((result) => alive && setData(result))
      .catch(() => alive && setData({ devices: null, recent: [] })); // старый сервер или нет сети — просто без чисел
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;
  return (
    <div className="border-t border-hair">
      <div className="flex min-h-16.75 items-center justify-between gap-3 py-2.5">
        <div>
          <p className="text-row text-ink">Geräte mit Mitteilungen</p>
        </div>
        <p className="text-subhead font-black text-ink tabular-nums">{data.devices ?? "–"}</p>
      </div>
      {data.recent?.length > 0 && (
        <div className="border-t border-hair py-2.5">
          <p className="mb-1.5 text-hint font-extrabold text-faint">Zuletzt gesendet</p>
          <ul className="flex flex-col gap-2">
            {data.recent.slice(0, 5).map((item, index) => (
              <li key={index} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-body-sm text-ink">{item.title}</span>
                  <span className="block text-caption text-faint">{lastSentLabel(item.sentAt).replace("Zuletzt: ", "")}</span>
                </span>
                <span className="shrink-0 text-caption text-muted">
                  {item.devices} {item.devices === 1 ? "Gerät" : "Geräte"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PushStats;
