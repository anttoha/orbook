# Часть 27b — Telegram-бот (личный чат)

Статус: дизайн ждёт «ок» (2026-11-12). Макеты: `design/neu/27b-telegram-bot/` (`gen.py`, PNG — `render.sh`).
Модель: Opus · effort medium.

## Зачем
Не все сидят в группе класса и не всем нужны все сообщения. Каждый подключает **свой чат** с ботом ORBook и сам выбирает, что получать. Группа из части 27 остаётся дополнительной опцией админки.

## Ответы владельца (2026-11-12)
1. Вход — **оба способа**: кнопка «Mit Telegram verbinden» в приложении (одноразовая ссылка) и Zugangscode прямо в боте.
2. Сервер хранит **номер Telegram-чата** (без имени и username) — ок, обязательно описать в Datenschutz.
3. Группа — остаётся опцией в админке (код части 27 не удалять).
4. Команды `/heute /morgen /woche /einstellungen /stop` — ок.

## Экраны приложения (макеты)
- **Mehr → Mitteilungen** — новая карточка «Telegram» под статусом push: «Lieber per Telegram?» + «Mit Telegram verbinden». После нажатия — шторка: 1) «In Telegram öffnen» (`t.me/<bot>?start=<одноразовый код>`), 2) «Starten» в Telegram; внизу «Warte auf Telegram …» (приложение опрашивает статус раз в 3 с, пока шторка открыта), подсказка про Zugangscode для другого телефона. Подключено — зелёная строка «Telegram · verbunden», «Bot öffnen», «Trennen».
- **Admin → Kanäle** — сверху «Bot @ORBookBot läuft», раздел «Persönlicher Bot» (переключатель «erlauben», число чатов без имён), «Gruppe der Klasse — zusätzlich, optional» одной строкой (внутри — прежний экран части 27), «Zuletzt gesendet» с числом чатов.
- ПК: те же карточки в правой панели (раскладка как в частях 17 и 27), отдельный макет не нужен.

## Диалоги бота (текстом, без макетов)
Тексты — по-немецки, коротко. Кнопки — inline-клавиатура, сообщение настроек редактируется на месте (`editMessageText`), а не присылается заново.

**Старт по ссылке из приложения** (`/start <код>`):
> ✅ Verbunden mit ORBook · 9b.
> Ich schreibe dir, wenn sich dein Plan ändert, eine Stunde ausfällt und abends, was morgen ansteht.
> [⚙️ Einstellungen] [📅 Heute] [📅 Morgen]

**Старт без кода** (`/start`):
> Hallo! Ich bin der Bot von ORBook.
> Schick mir deinen **Zugangscode** (z. B. ORB-A-…), oder öffne in der App: Mehr → Mitteilungen → „Mit Telegram verbinden“.

Сообщение с кодом доступа → проверка как вход в приложении (активный код, лимит устройств: **чат считается устройством кода**). Неверно: «Dieser Code passt nicht. Schau nochmal nach – Groß-/Kleinschreibung egal.» Сообщение с кодом бот сразу удаляет из чата (`deleteMessage`), чтобы код не висел в истории. 5 неверных попыток за 15 мин — пауза 15 мин.

**/einstellungen** (одно сообщение, переключатели — галочки ✅/▫️):
> **Was soll ich dir schicken?**
> [✅ Plan geändert] [✅ Stunde fällt aus]
> [✅ Für morgen · 30 Min. nach Schulschluss] [▫️ Neuer Test]
> [Kurse: Meine Kurse ▾] → «Meine Kurse» / «Ganze Klasse»; «Meine Kurse» — список Wahl-курсов кнопками (как «Meine Kurse» в приложении)
> [Ruhezeit: 21:00–06:30 ▾] → aus / 20:00 / 21:00 / 22:00 × 06:00 / 06:30 / 07:00
> [Fertig]

По умолчанию — как у Mitteilungen: первые три вкл., «Neuer Test» выкл., «Ganze Klasse» (курсов бот не знает, пока не выбраны). Подключение из приложения передаёт выбранные курсы устройства.

**/heute, /morgen** — план дня одним сообщением (тот же текст, что в группе: уроки, изменения, тесты и домашки), ссылка на приложение. **/woche** — пять строк Mo–Fr: «Mo 17.11. · 6 Std · 1 Änderung», ссылка.
**/stop** — «Du bekommst nichts mehr. Wieder anfangen: /start» → запись чата удаляется полностью.
Бот заблокирован пользователем (403 от Telegram) → запись удаляется. Код выключен/удалён в админке → чат отключается, одно сообщение «Dein Zugang wurde beendet.»
Ruhezeit: «Stunde fällt aus» в ночь — уходит в конец Ruhezeit, если ещё актуально (как push).

## Бэкенд (`/opt/orbook-be`, план — на «ок» владельца вместе с дизайном)
- Миграция 0014: `telegram_chats` (`chat_id`, `access_code_id`, `prefs_json`, `courses_json`, `created_at`, `last_sent_at`) — без имени и username; `telegram_links` (хэш одноразового кода, `device`/`access_code_id`, `expires_at` 15 мин).
- Опрос `getUpdates` из части 27 теперь разбирает и личные сообщения (`/start`, команды, callback-кнопки); группа работает как раньше.
- Рассылка: те же события (план, «fällt aus», «Für morgen», новый тест) и тексты `channels/texts.py`; фильтр по курсам и Ruhezeit чата; без повторов через `push_sent`-подобный ключ; лимит Telegram ~25 сообщений/с.
- API: `POST /api/telegram/link` → `{url, expiresAt}`; `GET /api/telegram/status` → `{connected}` (по устройству); `DELETE /api/telegram` (Trennen); админка: `channels.bot.enabled`, `GET /api/admin/channels` + `bot: {chats, recent}`.
- Docs: `API.md`, `FRONTEND.md`, `openapi.json`; демо — `scripts/update.sh`/перезапуск.

## Фронт
`components/push/TelegramCard.jsx`, `TelegramConnectSheet.jsx`, `shared/api/telegram.js`, логика статуса — `shared/utils/telegram.js` (+ тест). Админка: `components/admin/channels/BotCard.jsx`, группа — строка, ведущая на прежний экран. Datenschutz: номер Telegram-чата, настройки, когда удаляется (/stop, блокировка, выключение кода); Telegram — внешний сервис (сообщения идут через серверы Telegram). Changelog — при релизе.
