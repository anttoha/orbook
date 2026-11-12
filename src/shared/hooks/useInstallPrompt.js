import { useSyncExternalStore } from "react";
import { isStandalone, readEnvironment } from "../utils/push";
import { canPromptInstall, subscribeInstall } from "../utils/serviceWorker";

// Можно ли предложить «Installieren» и как:
//   "prompt" — Android/Chrome/Edge: окно браузера; "ios" — iPhone в Safari: шаги; null — уже установлено или нельзя
export function useInstallPrompt() {
  const available = useSyncExternalStore(subscribeInstall, canPromptInstall, () => false);
  if (isStandalone()) return null;
  if (available) return "prompt";
  return readEnvironment().isIos ? "ios" : null;
}
