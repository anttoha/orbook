import { useEffect } from "react";
import { usePlanStore } from "../store/planStore";
import { useSyncStore } from "../store/syncStore";
import { useUserStore } from "../store/userStore";

const AFTER_EDIT_MS = 5000; // після зміни нотатки чекаємо 5 с: кілька правок підряд — одна синхронізація

// ─────────────────────────────────────────────────────────────
// Коли синхронізувати нотатки (docs/frontend/06-notizen.md):
// після входу, при поверненні на вкладку, коли з'явилась мережа, і через 5 с після зміни нотаток.
// enabled — увійшли і школа не вимкнула синхронізацію. Без коду runSync нічого не робить.
// ─────────────────────────────────────────────────────────────
export function useNotesSync(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const run = () => useSyncStore.getState().runSync();
    run(); // одразу після входу

    const onVisible = () => document.visibilityState === "visible" && run();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", run);

    // Нотатки змінились (не самою синхронізацією) — синхронізувати трохи пізніше
    let timer;
    const stop = useUserStore.subscribe((state, prev) => {
      if (state.notes === prev.notes || state.notes === useSyncStore.getState().lastSynced) return;
      clearTimeout(timer);
      timer = setTimeout(run, AFTER_EDIT_MS);
    });

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", run);
      stop();
      clearTimeout(timer);
    };
  }, [enabled]);
}

// Чи синхронізуються нотатки зараз: є код і школа не вимкнула (me.features.notesSync, 403 feature_disabled)
export function useSyncOn() {
  const hasCode = useSyncStore((s) => Boolean(s.code) && !s.disabled);
  const allowed = useSyncAllowed();
  return hasCode && allowed;
}

// Чи дозволена синхронізація школою (без коду теж): тоді показуємо рядок у «Mehr» і кнопку в Datenschutz
export function useSyncAllowed() {
  const disabled = useSyncStore((s) => s.disabled);
  const allowed = usePlanStore((s) => s.me?.features?.notesSync !== false);
  return allowed && !disabled;
}
