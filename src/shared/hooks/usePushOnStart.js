import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePushStore } from "../store/pushStore";
import { useUserStore } from "../store/userStore";

// Mitteilungen в фоне (часть 17):
//  • при старте раз в сутки напомнить серверу об устройстве (иначе через 60 дней тишины он его забудет);
//  • поменяли «Meine Kurse» — сразу отправить новые курсы;
//  • sw.js не смог открыть день сам (старый браузер) — он присылает сообщение, переходим здесь.
export function usePushOnStart(active) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!active) return undefined; // не вошли — серверу нечего сообщать
    usePushStore.getState().refresh();
    // подписка на смену picked: zustand вызывает функцию при каждом изменении стора
    const stop = useUserStore.subscribe((state, before) => {
      if (state.picked !== before.picked && usePushStore.getState().mine) usePushStore.getState().refresh(true);
    });
    return stop;
  }, [active]);

  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return undefined;
    const onMessage = (event) => {
      if (event.data?.type === "open" && typeof event.data.url === "string") {
        navigate(new URL(event.data.url, window.location.origin).pathname);
      }
    };
    sw.addEventListener("message", onMessage);
    return () => sw.removeEventListener("message", onMessage);
  }, [navigate]);
}
