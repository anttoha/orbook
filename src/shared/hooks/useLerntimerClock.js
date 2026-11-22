import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cancelTimerAlarm, hasTimerAlarm, setTimerAlarm } from "../api/android";
import { translate } from "../i18n/translate";
import { useLerntimerStore } from "../store/lerntimerStore";
import { usePlanStore } from "../store/planStore";
import { phaseEnd } from "../utils/lerntimer";

const LATE_MS = 5000; // фаза кончилась давно (вкладку открыли позже) — звенеть уже поздно

// Короткий «дзынь» из трёх нот (Web Audio, без файлов). Браузер может запретить звук до первого нажатия — тогда тихо
function chime() {
  try {
    const ctx = new AudioContext();
    [660, 880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + i * 0.16;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.55);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // нет Web Audio — без звука
  }
}

// Код предмета → имя («Ma» → «Mathe»); без предмета — «Ohne Fach»
const nameOf = (names, code) => (code ? (names?.[code] ?? code) : translate("Ohne Fach"));

// Звук и вибрация по настройкам
function ring(settings) {
  if (settings.sound) chime();
  if (settings.vibrate) navigator.vibrate?.([180, 90, 180]);
}

// ─────────────────────────────────────────────────────────────
// Часы Lerntimer (часть 44) — работают на любой странице, пока таймер идёт:
// раз в секунду проверяют, не кончилась ли фаза (store.settle), звенят и показывают тост (если мы не на /lerntimer).
// В Android-App ещё ставят будильник на конец фазы — уведомление придёт и при закрытом приложении.
// ─────────────────────────────────────────────────────────────
export function useLerntimerClock(enabled) {
  const run = useLerntimerStore((s) => s.run);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const names = usePlanStore((s) => s.meta?.subjects);
  const running = enabled && Boolean(run) && !run.pausedAt;
  const onPage = pathname === "/lerntimer";

  useEffect(() => {
    if (!running) return undefined;
    const check = () => {
      const store = useLerntimerStore.getState();
      const current = store.run;
      if (!current) return;
      const late = Date.now() - phaseEnd(current) > LATE_MS;
      const what = store.settle(Date.now());
      if (!what || late) return;
      ring(store.settings);
      // На странице таймера всё видно и так (шторка, кольцо). Исключение — «Pause von selbst starten»: шторки нет, нужен тост
      if (onPage && !(what === "focus" && store.settings.autoPause)) return;
      const text = what === "focus" ? translate("Runde geschafft · {fach}", { fach: nameOf(names, current.code) }) : translate("Pause vorbei");
      toast.success(text, onPage ? undefined : { action: { label: translate("Lerntimer"), onClick: () => navigate("/lerntimer") } });
    };
    check(); // открыли приложение — фаза могла кончиться, пока нас не было
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [running, onPage, navigate, names]);

  // Android: будильник на конец фазы; пауза, стоп или конец — убрать
  const alarmAt = running ? phaseEnd(run) : null;
  useEffect(() => {
    if (!hasTimerAlarm()) return;
    if (!alarmAt) return void cancelTimerAlarm();
    const { phase, code } = useLerntimerStore.getState().run ?? {};
    const text = phase === "pause" ? translate("Pause vorbei") : translate("Runde geschafft · {fach}", { fach: nameOf(names, code) });
    setTimerAlarm({ at: alarmAt, title: translate("Lerntimer"), text });
  }, [alarmAt, names]);
}
