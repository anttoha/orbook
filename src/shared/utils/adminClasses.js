// ─────────────────────────────────────────────────────────────
// Админка с несколькими школами и классами (часть 29c). Чистые функции без React.
// schools — ответ GET /api/admin/schools:
//   [{ id, name, number, baseUrl, passwordSet, classesInPlan, classes: [{ id, name, devices, codes, exams }] }]
// ─────────────────────────────────────────────────────────────
import { CLASS_COLORS } from "../constants/classColors";

const COLOR_KEYS = Object.keys(CLASS_COLORS);
const byName = (a, b) => a.localeCompare(b, "de", { numeric: true });

// Все классы сервера одним списком по номеру (класс № 1 — первый). Цвет значка — по порядку,
// чтобы у одного класса он был одинаковым в чипе, меню и на «Schulen & Klassen»
export function adminClassList(schools) {
  const list = (schools ?? []).flatMap((school) => (school.classes ?? []).map((item) => ({ id: item.id, name: item.name, school: { id: school.id, name: school.name } })));
  list.sort((a, b) => a.id - b.id);
  return list.map((item, index) => ({ ...item, color: COLOR_KEYS[index % COLOR_KEYS.length] }));
}

// Какой класс сейчас настраивает админ: выбранный (если он ещё есть) или первый
export const pickAdminClass = (list, id) => list.find((item) => item.id === id) ?? list[0] ?? null;

// Цвет значка класса по его номеру (список из adminClassList)
export const adminClassColor = (list, id) => list.find((item) => item.id === id)?.color ?? "accent";

// Поле «Klasse» у нового кода: классы из плана школы + уже созданные (их может не быть в старом плане).
// plan — GET /api/admin/schools/{id}/classes или null. → [{ value: "8a", id | null, isNew }]
export function schoolClassOptions(school, plan) {
  const known = new Map((school?.classes ?? []).map((item) => [item.name, item.id]));
  const names = [...new Set([...(plan?.classes ?? []).map((item) => item.name), ...known.keys()])].sort(byName);
  return names.map((name) => ({ value: name, id: known.get(name) ?? null, isNew: !known.has(name) }));
}

// Для какого класса новый код: { schoolId, className, id | null, isNew }; класс ещё не выбран — className: null
export const targetOf = (schoolId, option) => ({ schoolId, className: option?.value ?? null, id: option?.id ?? null, isNew: Boolean(option?.isNew) });

// Начальное значение полей «Schule/Klasse»: школа из «Code für neue Klasse» (класс выбрать самому)
// или класс из чипа админки. current — pickAdminClass(…); нет классов (старый сервер) — null
export function codeTarget(current, schoolId) {
  if (schoolId && schoolId !== current?.school.id) return targetOf(schoolId, null);
  return current ? { schoolId: current.school.id, className: current.name, id: current.id, isNew: false } : null;
}

// Тело запроса нового кода: класс из чипа — без полей (сервер возьмёт X-ORBook-Class), иначе schoolId + className
export const targetBody = (target, current) => (target?.className && target.id !== current?.id ? { schoolId: target.schoolId, className: target.className } : {});

// Код создан не для класса из чипа → id класса, на который переключить админку (иначе null).
// result — ответ создания кода: { class: { id, name } | undefined }; current — класс из чипа
export const otherClassOf = (result, current) => {
  const id = result?.class?.id ?? null;
  return id && id !== current?.id ? id : null;
};

// Плашка у школы: «Plan ok» (план скачан, классы известны), «Nicht getestet», «Zugang fehlt»
export function schoolStatus(school) {
  if (!school?.passwordSet) return { tone: "danger", label: "Zugang fehlt" };
  if ((school.classesInPlan ?? 0) > 0) return { tone: "ok", label: "Plan ok" };
  return { tone: "muted", label: "Nicht getestet" };
}

// «Nr. 10245678 · 42 Klassen im Plan» (номера или плана может не быть)
export function schoolLine(school, t = (s) => s) {
  const parts = [];
  if (school?.number) parts.push(`${t("Nr.")} ${school.number}`);
  if (school?.classesInPlan) parts.push(`${school.classesInPlan} ${t("Klassen im Plan")}`);
  return parts.join(" · ");
}

// «27 Geräte · 4 Codes · 5 Tests» (единственное число — «1 Gerät», «1 Code», «1 Test»)
export function classStats(item, t = (s) => s) {
  const part = (count, one, many) => `${count ?? 0} ${t(count === 1 ? one : many)}`;
  return [part(item.devices, "Gerät", "Geräte"), part(item.codes, "Code", "Codes"), part(item.exams, "Test", "Tests")].join(" · ");
}

// Einstellungen → «Klassen pro Gerät» (сервер принимает null, 1, 2, 3, 5, 10). В списке 0 = «Unbegrenzt»
// (список сравнивает значения строками, null там не выбрать); на сервер уходит null
export const CLASS_LIMITS = [
  { value: 0, label: "Unbegrenzt" },
  { value: 1, label: "1 Klasse" },
  ...[2, 3, 5, 10].map((value) => ({ value, label: `${value} Klassen` })),
];
