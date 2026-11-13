// Live (часть 26): одно долгое соединение GET /api/plan/stream (Server-Sent Events).
// Сервер сам пишет «status» после каждой проверки школы и «plan», когда план изменился —
// поэтому приложению не нужно спрашивать раз в 10 секунд. Cookie входа браузер отправляет сам.
//
// onStatus(status), onPlan({ days, lastChangeAt }) — события сервера
// onDown(closed) — связь пропала: closed = true — браузер сам больше не переподключится
//                  (503 «Live aus», 401, нет EventSource); false — переподключается сам
// classId — часть 29: поток этого класса (EventSource не умеет заголовки, поэтому ?class=)
export function openPlanStream({ classId, onStatus, onPlan, onDown }) {
  if (typeof EventSource === "undefined") {
    onDown(true);
    return { close() {} };
  }
  const source = new EventSource(classId != null ? `/api/plan/stream?class=${classId}` : "/api/plan/stream");
  // Битое сообщение пропускаем: следующее «status» придёт через минуту
  const parse = (handler) => (event) => {
    try {
      handler(JSON.parse(event.data));
    } catch {
      // не JSON — игнорируем
    }
  };
  source.addEventListener("status", parse(onStatus));
  source.addEventListener("plan", parse(onPlan));
  source.onerror = () => {
    const closed = source.readyState === EventSource.CLOSED;
    if (closed) source.close();
    onDown(closed);
  };
  return { close: () => source.close() };
}
