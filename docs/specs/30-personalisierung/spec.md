# 30 · Personalisierung + Animationen

**Статус:** ждёт «ок дизайн» и «ок» плана (2026-11-14)
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
- Пока нет.

## Слова
- **Block** — карточка на Start с одним видом данных.
- **Design** — оформление целиком (Soft, Glas, Klar); **Thema** — светлая или тёмная.
- **Glas-Effekt · Einfach** — Glas без размытия, для слабых устройств.

## Открытые вопросы
- [ ] Что открывается при запуске: у новых «Start», у нынешних как было (предложение) — или всем «Start»? — владелец
- [ ] Три оформления (Soft, Glas, Klar) и их названия — владелец
- [ ] Набор из одиннадцати блоков: убрать или добавить — владелец
