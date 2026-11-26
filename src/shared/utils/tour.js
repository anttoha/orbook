// Rundgang (часть 52): шаги тура и чистые функции к ним — без React, поэтому их легко тестировать.
// Шаг: target — список меток data-tour (берём первую, что нашлась на экране);
// mode — "weiter" (кнопка), "tippen" (человек сам нажимает: шаг готов, когда адрес подходит под done),
// "probieren" (элемент под прожектором работает, дальше — «Weiter»).
// title/text — немецкий текст, его переводит t() в пузыре.

export const TOUR_STEPS = [
  { id: "fuer", target: ["block-fuer"], title: "Für dich jetzt", text: "Weg, Wetter und Änderungen für heute.", mode: "weiter" },
  { id: "woche", target: ["nav-woche"], title: "Deine Woche", text: "Öffne den Stundenplan.", mode: "tippen", done: (path) => path === "/woche" || path === "/", fallback: "/woche" },
  { id: "ausfall", target: ["ausfall", "woche-raster"], title: "Ausfall und Vertretung", text: "Rot gestrichelt – die Stunde fällt aus.", mode: "weiter" },
  { id: "heute", target: ["heute"], title: "Heute", text: "Öffne den heutigen Tag.", mode: "tippen", done: (path) => path === "/heute" || path.startsWith("/tag/"), fallback: "/heute" },
  { id: "stunde", target: ["stunde"], title: "Eine Stunde", text: "Lehrkraft, Raum, Notiz und Hausaufgaben.", mode: "weiter" },
  { id: "leistung", target: ["nav-leistung", "nav-tests"], title: "Tests und Noten", text: "Alles zu Tests, Noten und Aufgaben.", mode: "weiter" },
  { id: "mehr", target: ["nav-mehr"], title: "Mehr", text: "Hier steckt der Rest – und die Einstellungen.", mode: "tippen", done: (path) => path === "/mehr", fallback: "/mehr" },
  { id: "darstellung", target: ["darstellung"], title: "Darstellung", text: "Mach ORBook zu deinem.", mode: "tippen", done: (path) => path === "/mehr/darstellung", fallback: "/mehr/darstellung" },
  { id: "design", target: ["design"], title: "Design", text: "Probier Soft, Glas und Klar aus.", mode: "probieren" },
  { id: "akzent", target: ["akzent"], title: "Farbe", text: "Such dir deine Farbe aus.", mode: "probieren" },
  { id: "leiste", target: ["leiste"], title: "Untere Leiste", text: "Leg unten hin, was du oft brauchst.", mode: "weiter" },
];

// Сколько ждать элемент шага (план грузится, страница открывается), потом шаг пропускаем
export const WAIT_MS = 1500;

// Отступ прожектора вокруг элемента и от края экрана
export const PAD = 6;
const GAP = 14; // между прожектором и пузырём
const EDGE = 16; // пузырь не ближе к краю экрана

// Рамка прожектора: элемент + отступ, не вылезая за экран
export const spotRect = (rect, view) => {
  if (!rect) return null;
  const x = Math.max(EDGE / 2, rect.left - PAD);
  const y = Math.max(EDGE / 2, rect.top - PAD);
  const right = Math.min(view.width - EDGE / 2, rect.left + rect.width + PAD);
  const bottom = Math.min(view.height - EDGE / 2, rect.top + rect.height + PAD);
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
};

// Куда поставить пузырь: на ПК у узкого элемента слева (боковое меню) — справа от него,
// иначе снизу, если там хватает места, или сверху. Возвращает левый верхний угол и сторону хвостика.
export const bubblePlace = (spot, bubble, view) => {
  const clampX = (x) => Math.min(Math.max(EDGE, x), view.width - bubble.w - EDGE);
  const clampY = (y) => Math.min(Math.max(EDGE, y), view.height - bubble.h - EDGE);
  if (!spot) return { x: clampX((view.width - bubble.w) / 2), y: clampY((view.height - bubble.h) / 2), side: null, arrow: 0 };

  const centerX = spot.x + spot.w / 2;
  const roomRight = view.width - (spot.x + spot.w);
  if (view.width >= 1024 && spot.x < 300 && roomRight > bubble.w + GAP + EDGE) {
    const y = clampY(spot.y + spot.h / 2 - 36);
    return { x: spot.x + spot.w + GAP, y, side: "left", arrow: spot.y + spot.h / 2 - y };
  }
  const below = view.height - (spot.y + spot.h);
  const side = below >= bubble.h + GAP + EDGE || below >= spot.y ? "top" : "bottom";
  const x = clampX(centerX - bubble.w / 2);
  const y = side === "top" ? clampY(spot.y + spot.h + GAP) : clampY(spot.y - GAP - bubble.h);
  const arrow = Math.min(Math.max(24, centerX - x), bubble.w - 24); // хвостик смотрит на элемент
  return { x, y, side, arrow };
};

// Шаг-действие готов: человек открыл нужную страницу
export const stepDone = (step, path) => step?.mode === "tippen" && Boolean(step.done?.(path));
