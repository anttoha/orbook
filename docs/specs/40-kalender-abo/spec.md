# 40 · Kalender-Abo (webcal)

**Статус:** в работе (дизайн ок 2026-11-21; приватность: оба пункта — «да», владелец 2026-11-21)
**Источники:** `design/neu/40-kalender-abo/` (handy-01…08, pc-01…02), Soft 26 «Mitteilungen», часть 16 «Einladen»; бэкенд: `exams/ics.py` (ICS одной Klausur), `widget.py` (план/тесты/Termine с фильтром курсов), `security/invites.py` (токен ссылки), `security/memberships.py`.

## Зачем
Одна личная ссылка, по которой план (свои курсы, Ausfall и Vertretung), тесты и Termine сами появляются в Google, Apple или Outlook Kalender и сами обновляются. Не нужно открывать ORBook, чтобы увидеть, что завтра.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Ещё нет абонемента | `handy-01-leer` | пример дня в календаре, «Im Kalender» (3 переключателя), «Für welche Kurse», «Abo erstellen» |
| Абонемент есть | `handy-02-aktiv`, `pc-01-aktiv` | «Abo aktiv» + когда календарь последний раз забирал данные; «Zum Kalender», «Kopieren»; те же настройки; «Link erneuern», «Abo löschen». На ПК справа QR |
| Выбор календаря | `handy-03-kalender-waehlen` (шторка), `pc-02-kalender-waehlen` (меню) | Google, Apple, Outlook, «Anderer Kalender» |
| Тост | `handy-04-kopiert` | «Link kopiert» |
| Вопросы | `handy-05-erneuern`, `handy-06-loeschen` | «Link erneuern?», «Abo löschen?» |
| Загрузка / ошибка | `handy-07-laden`, `handy-08-fehler` | skeleton; «Gerade nicht erreichbar» + «Nochmal» |

Маршрут: `/mehr/kalender`. В «Mehr» — строка «Kalender-Abo» сразу после «Mitteilungen» (справа «an» / «Aus»), на ПК — пункт в меню настроек после «Mitteilungen».

## Что куда нажимать
- **Abo erstellen** → `PUT /api/calendar-feed` с выбором → экран «Abo aktiv» и сразу открывается шторка «In welchen Kalender?».
- **Zum Kalender** → шторка (телефон) / меню (ПК):
  - *Google Kalender* → `https://calendar.google.com/calendar/r?cid=<webcal-ссылка>` в новой вкладке;
  - *Apple Kalender* → сама ссылка `webcal://…` (iPhone/Mac открывают «Abonnieren»);
  - *Outlook* → `https://outlook.live.com/calendar/0/addfromweb?url=<https-ссылка>&name=ORBook`;
  - *Anderer Kalender* → копирует ссылку, тост «Link kopiert».
- **Kopieren** → `https://…`-ссылка в буфер, тост «Link kopiert». Не вышло (старый браузер) → тост с ошибкой.
- **Переключатели и «Für welche Kurse»** → сразу `PUT /api/calendar-feed` (без кнопки «Speichern»); ошибка → тост, переключатель возвращается.
- **Link erneuern** → окно «Link erneuern?» → `POST /api/calendar-feed/renew` → новая ссылка, старая сразу 404.
- **Abo löschen** → окно «Abo löschen?» → `DELETE /api/calendar-feed` → экран «Noch kein Abo».
- **QR (ПК)** — та же `webcal://`-ссылка: телефон камерой открывает её и добавляет абонемент.

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| есть ли абонемент | `GET /api/calendar-feed` → `feed` | `null` — нет абонемента |
| ссылка | `feed.url` (https), `feed.webcalUrl` | `null`, если ключ сервера сменили → показываем только «Link erneuern» (кнопки ссылки неактивны) |
| «Vom Kalender abgerufen: heute 06:40» | `feed.lastFetchedAt` | `null` → «Noch nicht abgerufen» |
| переключатели | `feed.items.lessons / exams / appointments` | нет (по умолчанию все `true`) |
| «Meine Kurse · 7 / Ganze Klasse» | `feed.mine`; курсы — из «Meine Kurse» на устройстве | — |

Тело `PUT`: `{ items: {lessons, exams, appointments}, mine, courses, hidden }`. `courses` — `picked` из «Meine Kurse» (как у виджета: `[]` — все Wahl-курсы, `["keine"]` — ни одного), `hidden` — скрытые обязательные курсы. При `mine: false` — `courses: null, hidden: null` (весь класс).
Поменяли «Meine Kurse» → если абонемент есть и `mine` — фронт сам отправляет `PUT` с новыми курсами (как Mitteilungen, `usePushOnStart`). Что абонемент есть, устройство помнит локально (`calendarFeedStore`, по классам) — по этому же флагу «Mehr» пишет «an».

## Что в ленте (ICS)
- **Stunden** (если включено): дни с понедельника прошлой недели до конца следующей (дальше плана у сервера нет). Только курсы из выбора. Уроки без времени пропускаем.
  - обычный: `SUMMARY` «Deutsch», `LOCATION` «Raum 102», в описании Lehrkraft;
  - `room_change` / `substitution` / `added` / `moved`: «Mathe → Raum B12» (если сменился кабинет), иначе «Mathe · Vertretung»; описание «Vertretung · Kle statt Mü», `info` урока;
  - `cancelled`: «Englisch fällt aus», `TRANSP:TRANSPARENT` (в календаре не «занят»);
  - день ещё без плана (прогноз по Muster): уроки как обычно, в описании «Voraussichtlich – der Plan kommt noch.»
- **Tests und Klausuren**: прошедшие 30 дней и все будущие, на весь день: «Test Mathe · 2. Stunde», тема — в описании.
- **Termine**: прошедшие 30 дней и все будущие; с временем — по времени, иначе на весь день (несколько дней — `DTEND` = день после последнего). Место — `LOCATION`, заметка — описание.
- Название календаря «ORBook · 9b», подсказка обновлять раз в час (`REFRESH-INTERVAL`, `X-PUBLISHED-TTL` — Apple/Outlook слушаются, Google — нет).
- UID постоянные (`lesson-<класс>-<дата>-<урок>-<курс>`, `exam-<id>`, `appt-<id>`), чтобы календарь обновлял события, а не дублировал.

## Состояния
- **Загрузка:** skeleton (`handy-07`).
- **Офлайн / сервер не ответил:** карточка «Gerade nicht erreichbar» + «Nochmal» (`handy-08`). Уже подключённый календарь от этого не ломается.
- **Пусто:** абонемента нет → `handy-01`.
- **Особые случаи:**
  - устройство вышло из класса, код выключили, сменили пароль класса, сессия истекла → ссылка отдаёт 404 (решение владельца 2026-11-21);
  - `feed.url === null` (ключ сервера сменили) → «Link erneuern» доступен, остальное как есть;
  - `lastFetchedAt === null` → «Noch nicht abgerufen»;
  - урок без предмета (`subject: null`) → в названии `info` или «Stunde N»;
  - Android-App: ссылки Google/Outlook открываются во внешнем браузере (как остальные внешние ссылки).

## Бэкенд (`/opt/orbook-be`)
- Таблица `calendar_feeds`: `class_id`, `session_id` (CASCADE — удалили сессию → удалился абонемент), `token_hash` (HMAC, уникальный), `token_secret` (токен, зашифрованный ключом сервера — как у Einladungslink), `items` JSON, `courses`/`hidden` JSON или NULL, `created_at`, `updated_at`, `last_fetched_at`. Одна запись на (устройство, класс). Миграция `0017`.
- Токен — `secrets.token_urlsafe(24)` (192 бита: ссылка публичная, перебрать нельзя).
- `GET /api/calendar-feed` → `{ feed: null | { url, webcalUrl, items, mine, createdAt, lastFetchedAt } }` (класс по `X-ORBook-Class`).
- `PUT /api/calendar-feed` — создать или изменить (лимит 30/мин).
- `POST /api/calendar-feed/renew` — новый токен. `DELETE /api/calendar-feed` → 204.
- `GET /api/public/calendar/{token}.ics` — без cookie; `text/calendar`; неизвестный токен или недействительное членство/сессия → 404; лимит 60 запросов/мин на ссылку; `last_fetched_at` пишется не чаще раза в 10 мин; IP и User-Agent не пишем.
- `memberships.remove` удаляет и абонемент этого класса на устройстве.
- Docs: `API.md`, `FRONTEND.md`, `openapi.json`, SPEC §10.2 (теперь есть подписка по ссылке).

## Datenschutz
Новый абзац «Kalender-Abo»: сервер хранит ссылку (зашифрованно), выбор (что и для каких курсов) и время последнего запроса календаря; IP и User-Agent — нет. Кто знает ссылку, видит план, тесты и Termine класса (без имён учеников); календарь (Google, Apple, Microsoft) забирает эти данные по ссылке. Ссылка перестаёт работать при «Abo löschen», «Link erneuern» и когда устройство выходит из класса.

## Чего здесь НЕТ
- Hausaufgaben и заметки (их нет на сервере).
- Напоминаний (`VALARM`) — Google их в абонементах игнорирует.
- Отдельной настройки для админа (вкл./выкл. раздела) — абонемент есть у всех, кто вошёл в класс.
- Changelog — только при «на прод».

## Отличия от дизайна
- Нет.

## Слова
- **webcal** — адрес вида `webcal://…`: календарь понимает, что это подписка, а не одна скачанная запись.
- **ICS** — текстовый формат календаря (одна запись = `VEVENT`).
- **Абонемент (Abo)** — календарь сам периодически забирает ленту по ссылке и обновляет события.
- **UID** — постоянный номер события: по нему календарь узнаёт «то же событие, изменилось».
- **HMAC токена** — отпечаток ссылки для поиска в базе; по нему саму ссылку не восстановить.

## Открытые вопросы
- нет (приватность решена владельцем 2026-11-21).
