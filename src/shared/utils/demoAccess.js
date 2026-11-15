// Демо (часть 33): готовые коды из GET /api/public/info → demoAccess.
// На проде поля нет (null) — тогда null, и карточку не показываем.
export const demoCode = (info, role) => {
  const list = Array.isArray(info?.demoAccess) ? info.demoAccess : [];
  return list.find((item) => item?.role === role)?.code ?? null;
};
