# 30 · Personalisierung + Animationen

**Статус:** дизайн и план ок (ответы владельца 2026-11-14); 30a, 30b и 30c готовы на демо (2026-11-14), дальше 30d
**Источники:** `design/neu/30-personalisierung/` (`gen.py`, `build.py`, `index.html`), артефакт https://claude.ai/artifact/5oveTVwAgAxMkH77LwRvUz; пожелания владельца `docs/ideas/2026-11-11/ideas.md` (строки 11, 18, 21, 29) и 2026-11-14 (Liquid Glass, образец https://liquidglass.theatom.lk/); Soft 04 «Woche», 22 «Mehr», 24 «Darstellung».

## Зачем
Ученик сам собирает приложение под себя: что видно сразу после запуска, как оно выглядит и что написано в клетке урока. Кто ничего не менял, видит приложение как сейчас.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Start | `handy-01-start`, `pc-01-start` | Блоки на сетке: телефон — 2 колонки, ПК — 4. Кнопка «Anpassen» |
| Start · Anpassen | `handy-02-start-anpassen`, `pc-02-start-anpassen` | Минус (убрать), стрелки (размер), перетаскивание, «Block hinzufügen», «Fertig»; на ПК список блоков справа |
| Block (Blatt) | `handy-03-block` | Größe: Klein / Breit / Groß, настройки блока, «Vom Start entfernen» |
| Block hinzufügen (Blatt) | `handy-04-block-hinzufuegen` | Все блоки; галочка — уже на Start, «+» — добавить |
| Start · leer / lädt | `handy-05-start-leer`, `handy-06-start-laden` | Пустое состояние с кнопкой, скелет |
| Darstellung | `handy-07-darstellung`, `handy-08-darstellung-glas`, `pc-04-darstellung` | Thema, **Design**, **Akzentfarbe**, (Glas) **Hintergrund** и «Glas-Effekt», Startansicht (+ «Start»), **Animationen**, Schriftgröße, Sprache, ссылки «Start» и «Stundenplan», «Darstellung zurücksetzen» |
| Glas | `handy-09-start-glas`, `handy-10-woche-glas`, `pc-03-start-glas` | Те же экраны в оформлении Glas |
| Klar | `handy-11-start-klar`, `handy-12-woche-klar` | Те же экраны в оформлении Klar |
| Stundenplan | `handy-13-stundenplan` | Vorschau + настройки клетки урока, цветов, недели и дня |
| Was ist neu · Start | `handy-14-was-ist-neu` | Запись версии про Start, строка «Startansicht» (→ Darstellung), кнопки «Später» / «Mit Start öffnen» |
| Start · Angebot | `handy-15-start-angebot` | Карточка «Mit Start öffnen?» над блоками: «Ja» / × |

## Что куда нажимать
- Нижнее меню телефона: **Start · Woche · Tests · Mehr**; на ПК «Start» — первый пункт сайдбара. Маршрут `/start`.
- Блок на Start → его раздел (Jetzt → день, Woche → неделя, Tests → `/testen`, Aufgaben → Aufgaben, Notizen → заметка …).
- Ползунки справа сверху → режим «Anpassen»: блок держим и тянем (остальные раздвигаются), минус убирает, стрелки в углу меняют размер по кругу, нажатие на блок открывает его шторку. «Fertig» выходит из режима, стрелка «назад» в шапке возвращает раскладку по умолчанию (с вопросом).
- Mehr → Darstellung: выбор сразу действует, без кнопки «сохранить».
- Darstellung → «Stundenplan»: каждое изменение сразу видно в «Vorschau».

## Блоки
| Блок | Что показывает | Размеры | Настройки блока |
|---|---|---|---|
| Jetzt | текущий урок, сколько осталось, что дальше; вне уроков — первый урок следующего дня | Breit | — |
| Heute | все уроки дня списком | Breit, Groß | — |
| Woche | неделя в миниатюре (Kürzel, выпавшие уроки, точка — тест) | Groß | — |
| Tests | ближайшие тесты | Klein, Breit, Groß | Einträge 2/3/5, «Nur meine Kurse» |
| Aufgaben | сколько открыто и ближайшая | Klein, Breit | — |
| Änderungen | Ausfall и Vertretung на сегодня/завтра | Klein, Breit | — |
| Termine | ближайшие Termine | Klein, Breit | Einträge 2/3/5 |
| Notizen | последние заметки | Klein, Breit | — |
| Materialien | новые ссылки класса | Klein, Breit | — |
| Statistik | Ausfall за неделю | Klein | — |
| Countdown | учебных дней до ближайших каникул (из Termine вида «Frei») | Klein | — |

Раскладка по умолчанию: Jetzt, Tests, Aufgaben, Woche, Änderungen, Notizen. Блок раздела, который школа выключила (`me.features`), не показывается и не предлагается.

## Данные
Новых запросов нет: блоки читают то, что уже лежит в `planStore`, `tasksStore`, `appointmentsStore`, `materialsStore`, `userStore` (заметки) и `/api/exams`, `/api/stats`.

| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Jetzt | неделя из `planStore` + `meta.serverTime` | да → «Heute kein Unterricht» / следующий учебный день |
| Tests, Aufgaben, Termine, Materialien, Notizen | их store | да → короткая строка «Nichts offen» и т. п. |
| Statistik | `GET /api/stats` (кеш) | да → блок скрыт, если школа выключила статистику |
| Countdown | Termine вида «Frei» | да → блок показывает «Keine Ferien eingetragen» |

## Состояния
- Загрузка: скелет блоков (`handy-06`).
- Офлайн: блоки из кеша, как на остальных экранах; плашка Offline общая.
- Ошибка: блок показывает свою короткую строку и не ломает соседей (границы ошибок на блок).
- Пусто: «Noch keine Blöcke» + «Block hinzufügen».
- Особые случаи: слабое устройство или «меньше прозрачности» в системе → Glas сам идёт в режиме «Einfach»; `prefers-reduced-motion` → «Animationen» по умолчанию «Weniger».

## План кода (под-части, каждая — отдельный чат)
**30a · Оформления и анимации** — Opus · effort medium
- Настройки устройства в `userStore`: `design` (soft | glas | klar), `accent`, `glassBg`, `glassMode` (voll | einfach), `motion` (voll | weniger | aus).
- На `<html>`: `data-design`, `data-accent`, `data-glass-bg`, `data-motion` (ставит `useTheme`/новый `useAppearance`). В `src/index.css` — блоки `[data-design="glas"]`, `[data-design="klar"]` (+ их `.dark`-пары), которые переопределяют те же токены `--color-*`, `--radius-*`, `--shadow-*`; компоненты не меняются.
- Glas — **свой CSS**, без пакета `@zakisheriff/liquid-glass`: у нас уже есть свои Button/Sheet/Segmented, пакет принёс бы вторые такие же (+32 КБ); эффект — `backdrop-filter: blur() saturate()` + светлый край. Одно правило вида `[data-design="glas"] .bg-card { backdrop-filter … }` даёт стекло всем карточкам. Запасной вид: `@supports not (backdrop-filter: blur(1px))`, `prefers-reduced-transparency`, ручной «Einfach».
- Фон Glas — фиксированный слой с размытыми пятнами (CSS-градиенты, без картинок).
- Акцент — шесть наборов токенов `--color-accent*`/`--color-tint` (светлые и тёмные значения).
- Анимации: класс/атрибут `data-motion`; «Weniger» оставляет только плавное появление, «Aus» выключает всё (`usePageAnimation`, шторки, Segmented, тосты). Новые движения: появление блоков на Start по очереди, нажатие (лёгкое сжатие), смена недели.
- Экран «Darstellung» по макету; тест токенов (`designTokens.test.js`) расширить на новые блоки.

**30b · Stundenplan** — Opus · effort medium
- `userStore.plan`: `lessonLabel` (kuerzel | name), `showRoom`, `showTeacher`, `showTimes`, `subjectStyle` (flaeche | streifen | aus), `showFree`, `cancelled` (durchstreichen | ausblenden), `showBreaks`; сюда же по смыслу — `showWeekend`, `compactWeek`, `dayView`, `changedFormat` (поля остаются на месте, меняется только экран).
- Чистая функция `shared/utils/planView.js` (с тестом): из урока и настроек → что написать в клетке. Неделя, день, «Nebeneinander» и блоки Start берут подписи из неё.
- Страница `/mehr/darstellung/stundenplan` с «Vorschau».

**30c · Start** — Opus · effort high
- `userStore.startBlocks`: список `{ id, kind, size, opts }` — **только порядок и размер**, без координат: сетка CSS сама раскладывает на 2 (телефон) или 4 (ПК) колонки, поэтому одна раскладка годится для обоих.
- `shared/utils/startBlocks.js` (с тестами): раскладка по умолчанию, добавить / убрать / переставить / размер, отбрасывание неизвестных видов.
- Компоненты `components/start/` (по одному на блок, общий `BlockCard`), страница `pages/Start.jsx`, вкладка в `navTabs`, «Startansicht: Start | Woche | Heute».
- Перетаскивание: **новая зависимость `@dnd-kit/core` + `@dnd-kit/sortable`** (~13 КБ gzip). Зачем: перетаскивание пальцем с прокруткой страницы, с клавиатуры и для экранных читалок — своими силами это несколько сотен строк и много краевых случаев. Если пакет не подойдёт к React 19 — запасной путь: кнопки «вверх/вниз» в шторке блока.

**30d · Sync, Datenschutz, Changelog** — Sonnet · effort medium
- `darstellungOf` в `syncPayload.js` дополняется новыми полями (design, accent, glassBg, motion, plan, startBlocks); старые версии приложения незнакомые поля пропускают — проверить тестом.
- `src/shared/datenschutz.js`: новые настройки лежат на устройстве и в зашифрованном Sync-блоке.
- Все новые тексты — в `t("…")`, пары в `i18n/en.js` и `uk.js`.
- Запись в `changelog.js` — при релизе.

## Бэкенд
Не нужен: всё хранится на устройстве и едет через существующий `/api/sync`.

## Чего здесь НЕТ
- Виджетов на рабочем столе телефона — это часть 31.
- Своих картинок для фона и свободной раскраски каждого элемента.
- Настроек «по умолчанию для класса» от админа.
- Отдельных раскладок Start для каждого класса: раскладка одна на устройство, данные — открытого класса.

## Отличия от дизайна
- 30a: в Klar кнопки и переключатели остаются круглыми «таблетками» (`rounded-full` не токен); углы карточек, клеток и полей — меньше, как в макете.
- 30a: в Klar и Glas клетки уроков пока залиты цветом предмета, как в Soft. Полоска вместо заливки — настройка «Fachfarbe» в 30b.
- 30b: «In der Stunde» (Kürzel/Name, Raum, Lehrkraft) — для клеток недели на телефоне, где мало места; на ПК и в списке дня всегда полное имя, учитель и кабинет. Остальное (Fachfarbe, Uhrzeit links, Freie Stunden, Ausfall, Pausen) — везде: неделя телефон/ПК, Liste и Zeitleiste.
- 30b: «Lehrkraft» по умолчанию выключена — раньше учителя в клетке не было (кто ничего не менял, видит как раньше).
- 30b: «Änderung unter dem Tag» открывает шторку с выбором и превью (бывшая карточка «Plan» из Darstellung). Настройки недели и дня переехали из Darstellung в «Stundenplan»; в Darstellung — карточка «Anpassen» → «Stundenplan». Sync поля `plan` — в 30d.
- 30a: «Startansicht» пока Woche / Heute; «Start» и ссылки «Start» / «Stundenplan» в Darstellung появятся в 30b–30c.
- 30c: размеры на сетке — Klein 1×1, Breit 2×1, Groß 2×2 (ряд 124px телефон / 150px ПК, `auto-rows-block` в `index.css`); содержимое, которое не влезает, обрезается.
- 30c: стрелки размера только у блоков, где размеров больше одного (у Jetzt и Woche их нет, в макете есть).
- 30c: «Anpassen» — отдельный адрес `/start/anpassen` (нижнее меню там спрятано, «назад» выходит из режима). Перетаскивание: мышь — сразу, палец — после короткого удержания (200 мс), клавиатура — Пробел и стрелки, Enter — шторка блока.
- 30c: «Vom Start entfernen» и минус убирают сразу, с «Rückgängig» в сообщении; «Zurücksetzen» — с вопросом.
- 30c: «Was ist neu» умеет запись с `action: { label, startView }` (строка «Startansicht» и «Später» / «Mit Start öffnen»), картинка `start`; сама запись — в 30d.
- 30c: в Darstellung — «Startansicht: Start | Woche | Heute» и строка «Start» в «Anpassen» с меткой «Neu», пока Start не открывали.

## Слова
- **Block** — карточка на Start с одним видом данных.
- **Design** — оформление целиком (Soft, Glas, Klar); **Thema** — светлая или тёмная.
- **Glas-Effekt · Einfach** — Glas без размытия, для слабых устройств.

## Решения владельца (2026-11-14)
- **Glas — именно библиотека `@zakisheriff/liquid-glass`** (владелец: «надо именно это стекло и переходы»). Версия закреплена точно (`4.0.0`, MIT, без зависимостей, ~31 КБ JS + 5.5 КБ CSS gzip; код проверен: без сетевых запросов и `eval`, CSP сервера подходит — `img-src data:`). В Glas её компоненты заменяют наши внутри общих кирпичиков: `TabBar` → `GlassNav`, `Segmented` → `GlassSegmented` (кроме «только иконки»), `Switch` → `GlassSwitch`, `Sheet` на телефоне → `GlassSheet`, `ListCard` → `GlassCard`, `Button` и самодельные «таблетки» (`ui/PillButton`) → `GlassButton` (тянутся за пальцем), круглые кнопки шапок (`ui/RoundButton`) → `GlassButton`, однострочные `TextField` → `GlassInput`, чипы `ChoiceChips` → `GlassButton`, меню «⋮» недели, «+» в Aufgaben и `CodeMenu` → `GlassMenu`. Хук `useGlass()`. Нет аналога в библиотеке — остаются нашими: многострочные поля, `Select`, `Checkbox`, окна и панели на ПК, клетки и строки уроков. «Glas-Effekt · Einfach» → `setGlassQuality("low")`. Тема для неё — `data-theme` на `<html>`, акцент и шрифт — `--lg-*` в `index.css`. Остальные поверхности Glas — наш CSS (размытие + кромка).
- **Запуск:** новые пользователи начинают со Start. У остальных `startView` не меняется, но Start предлагается заметно: (1) в «Was ist neu» версии со Start — строка «Startansicht · Mehr → Darstellung» и кнопка «Mit Start öffnen» (запись changelog получает необязательное `action`: `{ label, startView }`); (2) на странице Start сверху карточка «Mit Start öffnen?» — «Ja» / ×, после ответа больше не показывается (`userStore.startOffer`: `null | "ja" | "nein"`); (3) в Darstellung точка «новое» у «Start», пока раздел не открывали. Делается в 30c (Start), запись в changelog — в 30d.
- **Оформления:** пока Soft, Glas, Klar; позже ещё темы — поэтому оформление = только набор токенов в `index.css` (`[data-design="…"]`), без правок компонентов.
- **Блоки:** пока одиннадцать; позже, может быть, ещё — блок = один компонент + строка в списке `BLOCKS`.

## Открытые вопросы
- нет
