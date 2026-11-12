# 26 · Schnelle Aktualisierung + Verlauf des Tages

**Статус:** дизайн ок, план бэкенда ок (2026-11-12); бэкенд `fa76cbd` на демо; фронт на демо 2026-11-12; прод — ждёт «на прод»
**Источники:** `design/neu/26-live-verlauf/` (артефакт https://claude.ai/artifact/VhcJWZifkkwJNWkLGoZjPf), идеи 09.11, 10.11 и 11.11 (`docs/ideas/2026-11-11/ideas.md`), пункт 20c в `docs/specs/README.md`, `/opt/orbook-be/docs/SPEC.md` §8.3, `/opt/orbook-be/docs/API.md` (Plan), код `/opt/orbook-be/src/orbook/plan/{poller,schedule,store,view}.py`, `src/shared/hooks/usePlanPolling.js`, `src/shared/store/planStore.js`, `src/components/sheets/{DayInfoSheet,DayPlanDetails}.jsx`.

## Зачем
Школа выложила новый план — он должен появиться в открытом приложении сам, за секунды, и сразу на все дни, которые школа опубликовала. Для каждого дня видно, какие версии плана были и что менялось. И видно, когда день проверяли: «плана ещё нет» больше не путается с «ещё не смотрели» (баг 20c).

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Info zum Tag | `handy-01-info`, `pc-01-verlauf` | новая карточка: «Verlauf des Tages · 3 Fassungen …» и «Zuletzt geprüft vor 20 Sek.» (вместо трёх серых строк). На ПК лента версий видна сразу в панели |
| Verlauf des Tages | `handy-02-verlauf`, `handy-04-verlauf-eine` | лента версий, новые сверху: время, что изменилось, у старых — «Ansehen» |
| Старая версия | `handy-03-fassung`, `pc-02-fassung` | день таким, каким он был; «Jetzt anders» у уроков, которые сейчас другие; «Ältere / Neuere» |
| Загрузка, ошибка | `handy-05-verlauf-laden`, `handy-06-verlauf-fehler` | скелет; «Der Verlauf kommt gerade nicht an» + «Nochmal versuchen» |
| Woche · Live | `handy-07-woche-live`, `handy-08-neuer-plan` | строка «● Live · geprüft vor 20 Sek. ›» вместо «aktualisiert vor …»; баннер «Neuer Plan · gerade eben» приходит сам |
| Plan-Status | `handy-09-plan-status`, `handy-10-status-fern`, `handy-11-nicht-live`, `pc-03-plan-status` | связь Live, пять дней недели с результатом проверки, «Diese Woche jetzt prüfen» |
| Tag без плана | `handy-12-plan-fehlt` | строка «Geprüft gerade eben · noch kein Plan» + «Jetzt prüfen» |

## Что куда нажимать
- День → (i) → «Info zum Tag» → строка «Verlauf des Tages» → шторка `?sheet=verlauf&datum=2026-09-17`.
- В ленте «Ansehen» у старой версии → та же шторка с `&fassung=<id>`; «‹» возвращает к ленте, «Ältere / Neuere» листают.
- Строка «Live …» под заголовком недели (на ПК — строка внизу левого меню) → «Plan-Status» (`?sheet=status&woche=<понедельник>`).
- «Diese Woche jetzt prüfen» и «Jetzt prüfen» в дне → `POST /api/plan/refresh` с открытой неделей. Ответ `429` → тост «Gerade erst geprüft. In N Sek. wieder möglich».
- «Neu laden» остаётся рядом со строкой «Live» (владелец просил, чтобы кнопку было видно).

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Лента версий | **новое** `GET /api/day/versions?date=` → `versions[] {id, fetchedAt, lessons, info}` | одна версия → «Seit der Veröffentlichung hat sich nichts geändert»; пусто (день без плана) → строки «Verlauf» нет |
| Что изменилось в версии | считает фронт: сравнение `lessons` соседних версий (`shared/utils/dayHistory.js`, на основе `planDiff.js`) с учётом «Meine Kurse» / «Alle Kurse» | изменились только чужие курсы → «Änderung in anderen Kursen» серым |
| «Info zum Tag» изменилось | сравнение `info` соседних версий | — |
| Live / nicht live | состояние соединения `GET /api/plan/stream` | нет соединения → «Nicht live», опрос раз в минуту |
| «geprüft vor …», «wieder in …» | событие `status` из потока (или `GET /api/plan/status`): `lastOkAt`, `nextFetchAt` | `null` → «noch nie» / строки нет |
| Строка дня в Plan-Status | `GET /api/week` → `days[]`: `status`, `changedAt`, **новое** `checkedAt` | `checkedAt: null` → «Noch nicht geprüft»; `holiday` → «Feiertag» / «Ferien» |
| «Geprüft … · noch kein Plan» в дне | `day.checkedAt` при `status: not_published` | `null` → «Noch nicht geprüft» |

Поля уроков в версиях такие же, как в `/api/day` (`subject`, `teacher`, `room`, `course` бывают `null`) — те же проверки и тест в `shared/utils`.

## Состояния
- Загрузка ленты: скелет из трёх строк. План дня при этом виден как обычно.
- Офлайн: лента не хранится на устройстве → «Den Verlauf gibt es nur mit Internet». Строка недели: «Offline» (как сейчас).
- Нет связи Live (сеть режет поток, сервер занят): приложение само спрашивает `/api/plan/status` раз в 60 с; строка «Nicht live · geprüft vor …»; поток пробует подключиться снова.
- Вкладка скрыта: поток закрывается, при возврате открывается и сразу проверяет статус (как сейчас при `visibilitychange`).
- Демо (`source: fixtures`): Live подключён, план не меняется; для показа ленты на демо — вторая версия дня через `orbook-demo import-raw`.
- Особые случаи: версия отличается только тем, что школа перевыложила тот же план — такой версии нет (сервер сравнивает содержимое); день стал «свободным» — лента остаётся, пока версии не удалены (30 дней).

## Бэкенд (в `/opt/orbook-be`; план ждёт «ок» владельца). Миграций базы нет
1. **Сразу вся неделя.** Быстрая проверка (сегодня и следующий учебный день, раз в минуту с 06:00 до 16:00) заметила новый или изменённый день → в том же цикле сервер проверяет все учебные дни до пятницы следующей недели. Обычная полная проверка (каждые `plan.pollMinutes`, ночью раз в час) охватывает тот же диапазон вместо «пяти ближайших дней». Запросы условные (304), пауза 1,5 с между файлами остаётся.
2. **Поток событий** `GET /api/plan/stream` (Server-Sent Events, только с входом класса). События: `status` (при подключении и после каждого цикла опроса: `lastOkAt`, `nextFetchAt`, `lastChangeAt`, `stale`), `plan` (план изменился: `days[]`, `lastChangeAt`); каждые 15 с — пустая строка-«пинг». Рассылка внутри процесса (`plan/bus.py`, очередь на соединение; сервис работает одним воркером). Не больше 200 соединений сразу (дальше `503`), соединение живёт до 30 минут и переподключается — так вышедшее из класса устройство не слушает вечно. nginx не меняем: ответ идёт с `X-Accel-Buffering: no`, «пинг» чаще, чем `proxy_read_timeout 30s`.
3. **Проверка по дням.** В `DayOut` новое поле `checkedAt` — когда этот день последний раз успешно спрашивали у школы (есть и у `not_published`; `null` — ещё не спрашивали). `fetchedAt` остаётся.
4. **«Jetzt prüfen» для недели.** `POST /api/plan/refresh` принимает необязательное `{"week": "JJJJ-MM-TT"}`: проверяются учебные дни этой недели (не раньше сегодня, не дальше 60 дней) и два ближайших дня. Без тела — как пункт 1. Лимит прежний: раз в минуту на весь сервер. В ответе добавляется `checkedDays`.
5. **История.** `GET /api/day/versions?date=` → версии дня из `plan_versions`, новые сверху, не больше 20, уроки с названиями предметов как в `/api/day`, с `ETag`. Версии уже хранятся 30 дней (`store.purge`), ничего нового в базе.
6. Частота опроса школы остаётся 60 с, пока владелец не решит иначе (вопрос ниже).
7. Тесты (`make lint test`), `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `docs/SPEC.md` §8.3, выкладка `scripts/update.sh`.

## Фронт
- `shared/api/planStream.js` — обёртка над `EventSource`; `shared/hooks/usePlanLive.js` заменяет `usePlanPolling` (поток, пока вкладка видима; без потока — опрос раз в 60 с). Правило про опрос в `CLAUDE.md` обновить.
- `planStore`: `live` (`live | connecting | off`), событие `plan` → `noticePlanChange` + перезагрузка открытых недель; `refreshPlan(monday)` передаёт неделю.
- `shared/utils/dayHistory.js` + тест: изменения между версиями, тексты («3. Std · Englisch», «Kle statt Mü · Raum 204 statt 108»), `null`-поля.
- Компоненты: `components/history/` (лента, строка изменения, вид старой версии), шторки `DayHistorySheet`, `PlanStatusSheet`; `LiveLine` вместо `WeekUpdated`; строка проверки в дне без плана; ПК — лента в панели «Info zum Tag», окошко над `SideNavFooter`.
- Changelog (0.11.0) и Datenschutz («frühere Fassungen des Plans, 30 Tage»).

## Чего здесь НЕТ
- Уведомлений на закрытое приложение (часть 17) и сообщений в каналы (часть 27).
- Сравнения текста «Info zum Tag» по словам — только пометка, что текст новый.
- Истории старше 30 дней и истории для админа отдельно.
- Мгновенного появления чужих записей (Tests, Hausaufgaben) — поток пока только про план; новые виды событий добавятся позже без переделки.

## Отличия от дизайна Soft
- «Info zum Tag»: три строки «Plan geändert / Veröffentlicht / Zuletzt geprüft» заменены карточкой с двумя строками — время изменений теперь видно в ленте.
- Баннер «Neuer Plan» (33) получил «gerade eben»; сам баннер прежний.

## Слова
- **Fassung** — версия плана дня: сервер сохраняет новую каждый раз, когда содержимое изменилось.
- **Live** — открытое приложение держит соединение с нашим сервером и получает сообщение «план новый» без запроса.
- **Server-Sent Events (SSE)** — простой способ, которым сервер шлёт браузеру события по одному долгому соединению.
- **Условный запрос (304)** — «изменилось ли с прошлого раза?»; если нет, школа отвечает коротким «нет» без файла.

## Решения владельца (12.11.2026)
- «ок дизайн», «ок» плана бэкенда.
- Частота: «чтобы сервер лишний раз не нагружать» → быстрая проверка остаётся 60 с; в админке можно реже (2 / 5 мин) или выключить (`plan.fastSeconds`).
- История 30 дней, меняется в админке (`plan.versionsDays`: 7 / 14 / 30 / 90).
- «Всё, что надо — в админке»: Admin → Einstellungen → «Aktualisierung»: «Heute und morgen prüfen», «Live-Aktualisierung» (`plan.live`), «Verlauf des Tages behalten».
- Больше анимаций: ореол точки Live, плашка «Neuer Plan» въезжает сверху и колокольчик качается, строки ленты и Plan-Status появляются по очереди, галочки «отскакивают», «Jetzt anders» выскакивает, старая Fassung плавно сменяется.

## Сделанные отличия от макета
- Строка дня в Plan-Status: «Plan da · Stand heute 07:12» (время публикации школы) вместо «seit / geändert» — у сервера нет надёжного признака «менялся после публикации».
- «Jetzt anders» — сиреневая полоска под уроком старой Fassung, а не бейдж в углу (там уже бывает VERTRETUNG).
- В дне без плана (без Muster) — подпись «Zuletzt geprüft vor …» под кнопкой «Jetzt prüfen» экрана «Plan fehlt noch».
