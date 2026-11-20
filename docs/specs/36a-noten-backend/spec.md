# 36a · Noten aus Home.InfoPoint — бэкенд и разбор

**Статус:** в работе (2026-11-20)
**Источники:** HAR владельца (`login.php`, `getdata.php`, `getdata.php?mode=summary`, `default.php` — только для разбора, в git не попадают), `design/neu/36-noten`, решения владельца в `docs/PROGRESS.md` (часть 36, «ок дизайн»).

## Зачем
Ученик видит свои оценки и пропуски из школьного cevex Home.InfoPoint прямо в ORBook. У InfoPoint нет JSON-API и CORS, поэтому браузер сам туда сходить не может — ходит сервер ORBook, но только как «транзит»: ничего не хранит и не пишет в лог.

## Экраны
В этой части экранов нет (экран «Noten» — часть 36b). Админке хватает двух обычных настроек (см. ниже), они видны в существующем разделе «Einstellungen» как поля.

## Бэкенд
1. **Настройки**
   - `school.infopointUrl` (уровень школы, `null` по умолчанию) — адрес InfoPoint, например `https://petrischule-th.de/hip/webapp`. Только `https://`, публичный адрес, без логина в адресе; путь разрешён. Слеш в конце убираем.
   - `features.noten` (уровень класса, по умолчанию `false`) — админ включает раздел.
   - В `features` ответа `/api/auth/me` и входа появляется `noten`: `true` только если включено **и** адрес задан (в демо адрес не нужен). Фронт показывает раздел по этому флагу.
2. **`POST /api/noten/abrufen`** — тело `{"username": "…", "password": "…"}` (вход класса или учителя нужен).
   Сервер: `default.php` (cookie) → `POST login.php` (`username`, `password`, `login=Anmelden`) → `getdata.php` → разбор → `logout.php`. Редиректы не выполняет сам, проверяет адрес на SSRF, ответ не больше 2 МБ, таймаут 15 с.
   Ответ `200`:
   ```json
   {"updatedAt": "2026-11-16", "fetchedAt": "2026-11-20T07:41:00Z",
    "subjects": [{"code": "ma", "name": "Mathematik",
      "grades": [{"date": "2026-09-09", "grade": "2-", "value": 2.3, "note": "Test Winkel",
                  "kind": "Standard", "weightLabel": "Doppelt", "weight": 2, "half": 1}],
      "finals": [{"half": 1, "grade": "2", "value": 2.0, "note": null}, {"half": 2, "grade": null, "value": null, "note": null}]}],
    "absences": {"days": [{"date": "…", "reason": null, "excused": true, "half": 1}],
                 "hours": [{"date": "…", "subject": "Mathematik", "amount": "2", "hours": 2, "reason": null, "excused": false, "half": 1}],
                 "summary": {"days": 4, "daysUnexcused": 0, "hours": 0, "hoursUnexcused": 0}}}
   ```
   Поля, которые бывают `null`: `updatedAt`, `grade`/`value` (пусто или «m.E.»), `note`, `reason`, `excused`, `weight` (незнакомое слово), `half`, `hours`, числа в `summary`.
3. **Ошибки** (тексты по-немецки):
   | Код | HTTP | Когда |
   |---|---|---|
   | `feature_disabled` | 403 | раздел выключен или адреса нет |
   | `infopoint_denied` | 403 | InfoPoint не пустил: неверный логин/пароль |
   | `too_often` | 429 | удачная загрузка была меньше 5 минут назад **или** 5 неудачных попыток за 10 минут (с устройства); `details.retryAfter` |
   | `rate_limited` | 429 | больше 30 запросов в минуту ко всей школе |
   | `infopoint_unreachable` | 502 | сеть, таймаут, 5xx, слишком большой ответ |
   | `infopoint_changed` | 502 | страница не похожа на InfoPoint (поменялся формат) |
4. **Без хранения:** логин, пароль, cookie и оценки нигде не сохраняются и не логируются (ни тело, ни имя пользователя, ни заголовки). Счётчики лимита — только в памяти, по номеру сессии устройства. Имя ученика и учителей из страницы **не отдаём** (минимум данных).
5. **Демо** (`ORBOOK_ENV=demo`): к школе не ходит, отдаёт выдуманный образец (`src/orbook/noten/beispiel.html`); пароль `falsch` → `infopoint_denied` — чтобы на демо можно было посмотреть ошибку.
6. Документация: `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `docs/DATENSCHUTZ.md`.

## Разбор страницы (`noten/parser.py`)
- Предмет: `<h3><a name='f_ma'>Mathematik</a> ( Lehrer)</h3>` → `code` = `ma` (нижний регистр), `name`; учитель отбрасывается.
- Таблица оценок: Datum, Zensur, Bemerkung, «Teilnote / Wichtung» («Standard / Einfach» → `kind`, `weightLabel`), Hj. («1.» → 1).
- `value`: «1»…«6» → число; «2+» → 1,7, «2-» → 2,3 (решение владельца ∓0,3); остальное → `null`.
- `weight`: Einfach 1, Doppelt 2, Dreifach 3, Vierfach 4, Halb 0,5; незнакомое → `null` (фронт считает ×1).
- Endnoten: «1. Hj.», «2. Hj.» → `finals`.
- Fehltage / Fehlstunden / Zusammenfassung; «Entschuldigt» → `true`, «Unentschuldigt»/«nein» → `false`, пусто → `null`. Fehlstunden в образце пустые, формат «Stunden / Minuten» неизвестен — отдаём текст `amount` и первое число как `hours`.
- «Letzte Aktualisierung: Montag, 16. November 2026» → `updatedAt`.
- Есть форма входа (`name="password"`) → `infopoint_denied`; нет ни «Zensuren», ни «Fehlzeiten» → `infopoint_changed`.
- `getdata.php?mode=summary` **не запрашиваем**: Endnoten есть и в подробной странице — на один запрос к школе меньше.

## Чего здесь НЕТ
- Экрана, кеша на устройстве, Sync, Notenrechner (36b); Android (36c).
- Хранения чего-либо на сервере; фоновой проверки.

## Слова
- **InfoPoint** — сайт школы (cevex Home.InfoPoint), где лежат оценки и пропуски.
- **Транзит** — сервер передаёт запрос и ответ, но ничего не запоминает.
- **SSRF** — атака, когда сервер заставляют сходить на внутренний адрес; защищаемся проверкой адреса.
- **Wichtung** — вес оценки (×1, ×2).

## Открытые вопросы
нет (приватность и «Abmelden» решены владельцем 2026-11-20).
