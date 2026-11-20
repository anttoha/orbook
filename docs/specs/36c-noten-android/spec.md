# 36c — Noten в Android-App

Источник: строка 36c в `docs/specs/README.md` (решения владельца 2026-11-20), дизайн 36 (`design/neu/36-noten`) и 31e (`design/neu/31e-offline-mitteilungen`). Новых экранов нет: в «Mitteilungen» появляется ещё одна строка-переключатель того же вида, что и остальные.

## Что видит пользователь
- В приложении экран «Noten» тот же, что на сайте (36b). Разница незаметна: «Anmelden» и «Aktualisieren» идут **с телефона прямо в InfoPoint**, а не через сервер ORBook.
- «Angemeldet bleiben» в приложении: имя и пароль лежат в хранилище приложения, зашифрованные ключом Android Keystore; в `localStorage` WebView пароля нет.
- «Mitteilungen» в приложении: пятая строка «Neue Note» (по умолчанию **выкл.**). Включена, общие Mitteilungen включены и логин сохранён — приложение примерно раз в 3 часа заходит в InfoPoint и, если появилась оценка, показывает «Neue Note in Mathe» (несколько — «Neue Noten in Mathe, Deutsch»). Нажатие открывает `/noten/<код>`. Без сохранённого логина строка серая с текстом «Erst in Noten mit „Angemeldet bleiben“ anmelden».
- Фоновая проверка обновляет и сам кеш: открыл «Noten» — уже свежие оценки с «neu».
- «Abmelden» стирает логин и оценки и в приложении.

## Техника
- **Адрес InfoPoint**: бэкенд отдаёт `infopointUrl` в `GET /api/meta` (только если раздел включён; **в демо `null`** — у демо выдуманный адрес). Сайт передаёт его приложению при каждом запросе.
- Нет адреса (демо) или старый сервер — приложение берёт оценки через `POST /api/noten/abrufen` с cookie входа (как виджеты `/api/widget`). Так на демо работает и фон, и «falsch».
- Kotlin (`android/…/noten/`):
  - `InfoPoint.kt` — как `orbook/noten/client.py`: `default.php` → `POST login.php` (без редиректов, 302 на `getdata.php` = вход) → `getdata.php` → `logout.php`; только `https://`, таймаут 15 с, ответ до 2 МБ.
  - `NotenParser.kt` — перенос `orbook/noten/parser.py` 1 в 1 (тот же JSON), тест сравнивает с ответом сервера на `beispiel.html`.
  - `NotenStore.kt` — логин, последние оценки и «уже показанные» оценки, AES-GCM ключом Keystore (`orbook-noten`), из резервной копии исключено.
  - `NotenCheck.kt` — те же лимиты, что на сервере: удачно — раз в 5 мин, 5 попыток за 10 мин (`too_often`, `retryAfter`); фон — `PeriodicWork` 3 ч, с сетью, не в Ruhezeit.
  - Мост: `notenState()`, `notenFetch(json)` (ответ событием `{type:"noten", id, ok, data|error}`), `notenData()`, `notenLogout()`.
- Фронт: `shared/api/noten.js` выбирает путь (мост или сервер), `notenStore` в приложении не хранит пароль и берёт свежие оценки из приложения; `appNotify.js` — ключ `newGrade`; Datenschutz — «Noten in der Android-App»; EN/UK.

## Решения (технические, приняты сами)
- Раз в 3 часа: InfoPoint школы обновляется редко (учителя вносят оценки днём), 30 учеников × 8 запросов в день — нагрузки нет.
- Ruhezeit — не проверяем вовсе (оценка придёт после неё).
- Пароль без «Angemeldet bleiben» — только в памяти страницы, как на сайте; фон тогда не работает.

## Проверка
`./gradlew testDemoDebugUnitTest`, `npm run lint`, `npm test`, `npm run build`, APK демо через `scripts/android-build.sh --site orbook-demo`.
