// ─────────────────────────────────────────────────────────────
// Сколько ждать анимацию карточки (часть 43), прежде чем показать следующую.
// «Animationen: Aus» (data-motion="aus") — анимаций нет вовсе, ждать нечего; «Weniger» — короткое проявление.
// ─────────────────────────────────────────────────────────────
export function motionMs(full) {
  const motion = document.documentElement.dataset.motion;
  if (motion === "aus") return 0;
  if (motion === "weniger") return Math.min(full, 150);
  return full;
}
