import { useEffect } from "react";
import { openPlanStream } from "../api/planStream";
import { useClasses } from "../store/classesStore";
import { usePlanStore } from "../store/planStore";

const POLL_MS = 60_000; // без Live спрашиваем /plan/status раз в минуту (сервер школы чаще всё равно не опрашивается)
const RETRY_MS = 60_000; // Live выключен или не открылся — пробуем снова через минуту
const GRACE_MS = 15_000; // соединение оборвалось и переподключается — столько ждём, прежде чем писать «Nicht live»

// ─────────────────────────────────────────────────────────────
// Часть 26: новый план приходит сам. Пока вкладка видна, держим поток /api/plan/stream;
// вкладка скрыта — закрываем (батарея, трафик). Потока нет — опрос раз в минуту, как запасной путь.
// Заменяет usePlanPolling (опрос раз в 10 секунд).
// ─────────────────────────────────────────────────────────────
export const usePlanLive = (enabled) => {
  const checkStatus = usePlanStore((s) => s.checkStatus);
  const applyStatus = usePlanStore((s) => s.applyStatus);
  const applyPlanEvent = usePlanStore((s) => s.applyPlanEvent);
  const setLive = usePlanStore((s) => s.setLive);
  const classId = useClasses((s) => s.activeId); // другой класс — новый поток (часть 29)

  useEffect(() => {
    if (!enabled) return undefined;
    let stream = null;
    let poll = null;
    let retry = null;
    let grace = null;

    const startPoll = () => {
      poll ??= setInterval(checkStatus, POLL_MS);
    };
    const stopPoll = () => {
      clearInterval(poll);
      poll = null;
    };
    const goOff = () => {
      setLive("off");
      startPoll();
    };

    const open = () => {
      if (stream || document.visibilityState !== "visible") return;
      setLive("connecting");
      stream = openPlanStream({
        classId,
        onStatus: (status) => {
          clearTimeout(grace);
          grace = null;
          setLive("live");
          stopPoll();
          applyStatus(status);
        },
        onPlan: applyPlanEvent,
        onDown: (closed) => {
          if (closed) {
            stream = null;
            goOff();
            clearTimeout(retry);
            retry = setTimeout(open, RETRY_MS);
          } else {
            // браузер переподключится сам (например, сервер закрыл поток через 30 минут)
            grace ??= setTimeout(goOff, GRACE_MS);
          }
        },
      });
    };

    const close = () => {
      stream?.close();
      stream = null;
      clearTimeout(retry);
      clearTimeout(grace);
      grace = null;
      stopPoll();
      setLive("off");
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkStatus(); // вернулись на вкладку — сразу узнать, не было ли нового плана
        open();
      } else close();
    };

    open();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      close();
    };
  }, [enabled, classId, checkStatus, applyStatus, applyPlanEvent, setLive]);
};
