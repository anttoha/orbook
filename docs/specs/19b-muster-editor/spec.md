# 19b · Muster-Editor

**Статус:** готово (2026-11-07; дизайн и план бэкенда — «ок» владельца)
**Источники:** `design/neu/19b-muster-editor/` (артефакт https://claude.ai/artifact/HLj5RCmDhDciv64gpoZCnV), часть 19 (`docs/specs/19-muster/spec.md`), бэкенд `/opt/orbook-be/src/orbook/plan/view.py` (`week_number`, `expected_lessons`, `_plan_day`), `appsettings.py` (`MusterSettings`), `/opt/orbook-be/docs/API.md` (`expectedLessons`, `/api/admin/settings`).

## Зачем
Автоматический Muster может ошибаться (мало недель, вечные замены, школа неправильно считает A/B). Админ может оставить автоматику или задать недели A и B сам, а также поправить, какая сейчас неделя.

## Решения владельца (2026-11-07)
- Источник «Automatisch / Vom Admin». При возврате на «Automatisch» своя сетка **сохраняется**, но не показывается.
- Вариант «Keine Wochen A und B» — **есть** (как один из трёх).
- Правит **только админ** (учителя и Editor-Codes — нет).

## Экраны
| Экран | Макет | Что на нём |
|---|---|---|
| Einstellungen · карточка Muster | handy-01 | строки «Muster bearbeiten» (источник) и «Wochen A und B» (буква, режим) |
| Muster · Automatisch | handy-02, pc-01 | выбор источника, строка «Diese Woche · KW 45 · WOCHE A», вкладки A/B, сетка только для просмотра (штриховка), «Gebaut aus KW 41–44» |
| Muster · Vom Admin | handy-03, pc-03 | сетка в цветах предметов, точка — своя правка, «+» — пустой урок, «Aus dem Plan übernehmen», «Speichern · N Änderungen» |
| Stunde bearbeiten | handy-04, pc-03 (панель) | курс (чипы), Lehrer, Raum, «Parallelkurs», «Leeren», «Übernehmen», «Automatisch war: …» |
| Woche A oder B? | handy-05, pc-02 | три варианта + полоска «So zählt ORBook» на 5 недель |
| Übernehmen? | handy-06, pc-04 | подтверждение: своя правка недели пропадёт |
| Gespeichert / Fehler | handy-07, handy-08, pc-05 | тост; при ошибке правки остаются, «Nochmal» |
| Leer / Lädt | handy-09, handy-10 | пустая сетка с «+»; skeleton |

## Что куда нажимать
- Einstellungen → «Muster bearbeiten» → `/admin/muster`. На ПК — пункт «Muster» в меню. Übersicht → Schnell → «Muster».
- «Vom Admin»: если своей сетки ещё нет, она заполняется из автоматики (на устройстве, до «Speichern»).
- Урок → шторка (ПК — панель справа). Чип курса ставит учителя курса из `/api/admin/courses`, его можно поменять.
- «Wochen A und B» → шторка/меню. Выбор сохраняется сразу (`PATCH /api/admin/settings`).
- Источник тоже сохраняется сразу. Сетка — только кнопкой «Speichern».
- Уход со страницы с несохранёнными правками → «Änderungen verwerfen?».

## Данные
| На экране | Откуда | Пусто? |
|---|---|---|
| источник, режим A/B | `GET /api/admin/settings` → `muster.source`, `muster.abMode` | по умолчанию `auto`, `school` |
| сетка админа | `GET /api/admin/muster` → `weeks.A/B` | `null` — ещё не сохраняли |
| сетка автоматики | `GET /api/admin/muster` → `auto.A/B`, `autoFrom`/`autoTo` | `[]` — нет прошлых планов (handy-09) |
| буква этой недели | `abWeek` (с поправкой), `schoolAbWeek` (как у школы) | `null` — школа не даёт номер недели или «Keine Wochen» |
| время уроков | `lessonTimes` | урок без времени — только номер |
| курсы для чипов | `GET /api/admin/courses` → `courses` (`teacher` бывает `null`) | — |

## Состояния
- Загрузка: skeleton (handy-10).
- Офлайн/ошибка загрузки: `AdminState` «Nicht geladen» с «Nochmal» (как в других разделах админки).
- Ошибка сохранения: тост «Nicht gespeichert · offline» с «Nochmal», правки не теряются.
- Пусто: сетка из «+» и подсказка (handy-09).
- «Keine Wochen A und B»: вкладок A/B нет, одна сетка (хранится как `A`).
- Сеанс админа истёк (401) — как везде в админке.

## Бэкенд (сделано, выложено 2026-11-07)
Без миграции: всё в таблице `settings`.
1. **Настройки** (`MusterSettings`): `source` — `auto` (по умолчанию) | `admin`; `abMode` — `school` (по умолчанию) | `swap` | `none`. Меняются через существующий `PATCH /api/admin/settings`, попадают в протокол как сейчас.
2. **Своя сетка** — ключ `internal.musterWeeks` (наружу только через новый эндпоинт): `{"A": [MusterLesson…], "B": [...]}`, `MusterLesson = {weekday 0–4, period 0–10, subject, course: {nr,label}|null, teacher|null, room|null}`. При `source=auto` не удаляется.
3. **`GET /api/admin/muster`** → `{source, abMode, abWeek, schoolAbWeek, weeks|null, updatedAt|null, auto: {A, B}, autoFrom, autoTo, lessonTimes}`. `auto` — то, что сейчас считает `expected_lessons` для каждого дня недели и недели 1/2 (на сегодня).
4. **`PUT /api/admin/muster`** `{weeks: {A, B}}` → тот же ответ. Проверка: день 0–4, урок 0–10, предмет 1–12 знаков, учитель/кабинет до 20, до 4 курсов в одном уроке, без дублей (урок + курс). Ошибки — по-немецки, 422. Запись в протокол «Muster gespeichert».
5. **Неделя A/B** (`week_number` и `day.week` у дней с планом): `swap` → `3 − неделя школы`, `none` → `null`. Значит буква в неделе/дне/`meta.abWeek` везде следует поправке. Автоматика внутри считает по неделе школы (иначе `swap` перепутал бы источники).
6. **`expectedLessons`**: при `source=admin` и сохранённой сетке — уроки из сетки этой недели (`none` или неизвестная неделя → `A`), время из `lessonTimes`, `status: normal`, названия предметов как у остальных. Иначе — автоматика как сейчас; при `none` автоматика берёт все прошлые такие же дни недели, без A/B.
7. Тесты: настройки, PUT/GET, проверки, `swap`/`none` в `week`, Muster из сетки, сохранение сетки при `auto`. Документация: `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `docs/PROGRESS.md`. Выкладка `scripts/update.sh` (демо и прод — бэкенд общий для обоих, как в прошлых частях).

## Фронт (после бэкенда)
- `pages/AdminMuster.jsx`, части в `components/admin/muster/` (`MusterGrid`, `MusterCell`, `LessonSheet`/`LessonPanel`, `AbSheet`/`AbMenu`, `KwStrip`).
- `shared/utils/musterEditor.js` (+ тест): сетка ↔ клетки, счётчик правок, «своя правка» (сравнение с `auto`), проверка, полоска KW (буквы следующих недель).
- `adminStore`: `muster` (загрузка, черновик, сохранение). Пункт меню `adminTabs` «Muster» (иконка `Layers`), строка в Übersicht → Schnell, строки в `MusterCard`.
- Для учеников ничего не меняется: `useWeek`/`muster.js` уже берут `expectedLessons` и `week`.

## Чего здесь НЕТ
- Muster больше 6/8 уроков на телефоне не умещается — сетка прокручивается; уроки 0 и 7–10 показываем, только если они есть.
- Разные Muster для разных курсов/учеников — один Muster на класс.
- Правка Muster учителями и Editor-Codes.
- История версий Muster.

## Отличия от дизайна
- В макете на телефоне 6 уроков; в коде строк столько, сколько уроков в сетке (минимум 6; урок 0 и 7–10 — только если есть).
- Кнопка «Speichern · N Änderungen» на телефоне плавает над нижним меню и видна, только пока есть несохранённые правки (как «Änderungen speichern» в Einstellungen); вместо серой «Gespeichert» — тост.
- Подпись над заголовком шторок серая, как у всех шторок приложения (в макете фиолетовая).
- Буква недели в строке «Wochen A und B» в Einstellungen видна, только если этот браузер вошёл и в класс (как в части 19).

## Слова
- **Muster** — обычное расписание недели A или B для дней, на которые плана ещё нет.
- **Automatisch** — Muster из настоящих планов последних недель (часть 19).
- **Vom Admin** — Muster, который админ сохранил сам.
- **abMode** — как считать неделю: как школа, наоборот (`swap`) или без A/B (`none`).
- **Parallelkurs** — два курса в одном уроке (например, Kunst или Bio).

## Как устроено во фронте
- `pages/AdminMuster.jsx` — страница; `components/admin/muster/` — `MusterGrid`, `MusterCell`, `LessonEditor`, `AbSwitch` (строка/карточка + шторка или выпадающее окно), `AbChoice`.
- `shared/hooks/useMusterDraft.js` — черновик сетки и «Speichern»; `shared/utils/musterEditor.js` (+13 тестов) — клетки, «своя правка», счётчик, строки сетки, полоска KW.
- `shared/api/admin.js` — `loadMuster`, `saveMuster`; источник и режим A/B — `saveSettings({ muster: … })`.
- Скриншоты: `/root/work/orbook-compare/19b-muster-editor/shots/`, скрипт `_tools/mustered.mjs` (подставные данные).

## Открытые вопросы
- нет
