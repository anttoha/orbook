# 10 · Statistik

**Статус:** в работе
**Источники:** дизайн «19 Statistik», «37 Statistik · zu wenig Daten» (телефон, светлая и тёмная); `/opt/orbook-be/docs/frontend/05-statistik.md`; `docs/API.md` → «Statistik»; бэкенд `api/stats.py`, `plan/stats.py` (2026-11-05).

## Зачем
Ученик видит, сколько уроков выпало и сколько было замен за месяц или неделю, какие предметы выпадают чаще всего и по каким предметам пишутся Klausuren.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Statistik | 19 (Handy Hell/Dunkel) | шапка «9b · September», переключатель Woche/Monat, 3 карточки, столбики по дням, два списка с полосками |
| Мало данных | 37 | та же шапка, по центру «Noch zu wenig Daten» |
| ПК | 20, 39 (PC) | **в части 12** (там же «Halbjahr», «nach Woche», «nach Stunde», «Ausfallquote») |

## Что куда нажимать
- Вкладка «Statistik» в нижнем меню (и строка итога недели на экране Woche).
- «Woche / Monat» — период. По умолчанию «Monat», как в дизайне. Выбор не сохраняется.

## Данные
| На экране | Откуда | Пусто? |
|---|---|---|
| «9b · September» / «9b · KW 45» | `me.className` + `period.from` (месяц или KW) | `className` null → только период |
| «11 · Stunden fallen aus» | `totals.cancelled` | 0 — показываем 0 |
| «9 · Vertretungen» | `substitutions + moved + added` (как на экране Woche) | |
| «+3 ggü. Aug» / «−2 ggü. Vorwoche» | разница с `previous.totals`; больше — красный, меньше — зелёный, «±0» — серый | не показывать, если `previous` null или `previous.daysCounted === 0` |
| «5 · Klausuren · bis 30. Sept» | `totals.exams`, `period.to` | |
| «Diese Woche nach Tag» | отдельный запрос `range=week`: `byWeekday[]`, серый столбик `cancelled`, сверху фиолетовый `substitutions` | все нули — пустые столбики |
| «Fällt am häufigsten aus» | `topCancelledSubjects[]` (до 5), длина полоски от максимума | пусто — раздел скрыт |
| «Klausuren nach Fach» | `examsBySubject[]` | пусто — раздел скрыт |
| «Gezählt wird ab 22. September» | `trackingSince` | null — без этого предложения |

Запросы (параллельно): `GET /api/stats?range=month` и `GET /api/stats?range=week`; в режиме «Woche» хватает одного. Дату не шлём: сервер берёт «сегодня» школы (в демо — подставное). Предмет без названия — `subjectName()` («Ohne Fach»), цвет — `fachDotClass` с личными «Fachfarben».

**Meine Kurse:** `picked = []` → без параметра; иначе `&courses=<nr,…>`. `NO_OPTIONAL` («keine») уходит как есть: сервер не знает такой номер и считает только обязательные уроки — это и есть «все Wahl-курсы выключены».

## Состояния
- Загрузка: скелет — три карточки, блок столбиков, строки списков.
- Офлайн / сервер недоступен: последний ответ из кеша (`loadWithCache`) + плашка `PlanBanner` («Offline · Stand von …»).
- Ошибка без кеша: `PlanError` «Statistik konnte nicht geladen werden» + «Erneut versuchen».
- Мало данных: `enoughData === false` → экран 37. `trackingSince === null` → тот же экран без даты.
- Выключена (`me.features.statistics === false`): вкладка в меню скрыта; если открыть адрес напрямую — сервер ответит `403`, показываем его текст через `PlanError`.

## Технические решения
- Кеш: ключ `stats:<range>:<courses>` — у разных «Meine Kurse» свои цифры.
- `conditional` (свой `If-None-Match`) не используем: страницу не опрашиваем, а `ETag` браузер и так проверяет сам.
- Логика без React — `shared/utils/stats.js` (+ тест): путь запроса, разница «ggü.», подписи, высоты столбиков.

## Бэкенд
Не нужно.

## Чего здесь НЕТ
- Раскладки ПК и «Halbjahr» (часть 12). Выбора другого месяца (в дизайне нет).

## Отличия от дизайна
- В режиме «Woche» подпись сравнения — «ggü. Vorwoche» (в дизайне только месяц).
- Цифры в режиме «мало данных» не показываем — как в макете 37.

## Слова
- **ggü.** — «gegenüber», по сравнению с прошлым периодом.
- **Vertretung** — урок ведёт другой учитель (и перенос/добавленный урок, как на экране Woche).
- **trackingSince** — с какого дня сервер начал считать.

## Открытые вопросы
- нет
