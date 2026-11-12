# 17 · ORBook als App + Mitteilungen (PWA + Web Push)

**Статус:** дизайн ок, план ок (2026-11-12, «тексты — по-человечески»; приватность — на усмотрение: храним только номера Wahl-курсов); бэкенд `e4f868b` + `reminderTime` на демо (схема 0013); фронт на демо 2026-11-12; прод — ждёт «на прод»
**Источники:** `design/neu/17-pwa-push/` (генератор `gen.py`, обзор `build.py` → `index.html`), Soft 26 «Mitteilungen» и PC 26 «Einstellungen · Mitteilungen», `/opt/orbook-be/docs/SPEC.md` §13 (Web Push), §5.2 (`features.push`), `docs/frontend/07-einstellungen.md`, `08-zustaende.md` (PWA), `10-build-sicherheit.md` (Push), `DATENSCHUTZ.md` («В будущем (этап 8)»).

## Зачем
ORBook ставится на телефон и компьютер как приложение (своя иконка, без строки браузера). Когда план на завтра поменялся, сегодня выпал урок или завтра тест/домашка — приходит уведомление, даже если приложение закрыто. Каждый выбирает, что получать, по своим курсам или по всему классу, и «Ruhezeit».

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Mitteilungen · an | `handy-01-an`, `pc-01-an` | «An auf diesem Gerät · Zuletzt: heute 07:14» + «Test senden»; «So sieht es aus»; 4 переключателя; «Für welche Kurse» (Meine Kurse / Ganze Klasse); Ruhezeit; «Auf diesem Gerät ausschalten» |
| Mitteilungen · aus | `handy-02-aus`, `pc-02-aus` | «Mitteilungen sind aus» + «Einschalten» (браузер спросит разрешение); ниже — что будет, серым. ПК: рядом «Als App installieren» |
| iPhone без установки | `handy-03-iphone`, `handy-04-iphone-anleitung` | «Erst zum Home-Bildschirm» + «So geht's» → шторка из 3 шагов (Teilen → Zum Home-Bildschirm → открыть) |
| Заблокировано | `handy-05-blockiert` | «Im Browser blockiert» + как разрешить снова + «Nochmal prüfen» |
| Ruhezeit | `handy-06-ruhezeit` | шторка: Von / Bis, подсказка про выпавшие уроки, «Fertig» |
| Test / ошибка | `handy-07-test`, `handy-08-fehler` | тост «Test gesendet …», сверху приходит само уведомление; без сети переключатель возвращается, тост «Nicht gespeichert – keine Verbindung» |
| Mehr | `handy-09-mehr` | сверху «ORBook als App · Installieren» (пока не установлено, можно закрыть ✕); в «Einstellungen» строка «Mitteilungen · 3 von 4 an» (NEU) |
| Admin · Einstellungen | `handy-10-admin` | «Mitteilungen erlauben» (`features.push`), «Erinnerung für morgen · 18:00», «Geräte mit Mitteilungen · 14», «Zuletzt gesendet» |

## Что куда нажимать
- Mehr → «Mitteilungen» (`/mehr/mitteilungen`; на ПК — пункт в левом меню Einstellungen). Пункт скрыт, если `me.features.push === false`.
- «Einschalten» → `Notification.requestPermission()` → `pushManager.subscribe` → `PUT /api/push/subscription`. Отказ → экран «blockiert».
- Переключатели, «Für welche Kurse», Ruhezeit → сразу `PUT /api/push/subscription` (тот же endpoint, новые `prefs`). Ошибка сети → значение возвращается, тост.
- «Test senden» → `POST /api/push/test` (лимит: раз в 30 с) → тост.
- «Auf diesem Gerät ausschalten» → `DELETE /api/push/subscription` + `subscription.unsubscribe()`.
- «Installieren»: Android/ПК Chrome/Edge — системное окно (`beforeinstallprompt`); iPhone — шторка с шагами. Карточка в Mehr исчезает после установки или ✕ (запоминается на устройстве).
- Нажатие на уведомление → открывает ORBook на нужном дне (`url` из уведомления, например `/tag/2026-11-13`).

## Какие уведомления (тексты — по-немецки, без имён)
| Пункт | Когда | Пример |
|---|---|---|
| `planTomorrow` «Plan für morgen geändert» | новая версия плана следующего учебного дня, и в ней изменились уроки моих курсов | «Morgen: 4. Std Geschichte → Vertretung, Raum B12» (несколько — «Morgen: 3 Änderungen · Mathe, Englisch, Sport») |
| `cancelledToday` «Stunde fällt heute aus» | в плане на сегодня появился выпавший урок моего курса (урок ещё не начался) | «Heute fällt die 5. Std Physik aus» |
| `reminder` «Erinnerung für morgen» | в `push.reminderTime` (по умолчанию 18:00) накануне учебного дня, если на завтра есть Test или Hausaufgabe моих курсов | «Morgen: Mathe-Test (KA) · 2 Hausaufgaben» |
| `newExam` «Neuer Test eingetragen» | кто-то добавил Test моих курсов (кроме своего устройства) | «Neu: Englisch-Test am Do 20.11.» |

В Ruhezeit ничего не приходит; `cancelledToday` из Ruhezeit — сразу после её конца, если урок ещё не прошёл; остальное в Ruhezeit пропадает (утром всё видно в приложении). Одно и то же не приходит дважды (`push_sent`).

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| вкл./выкл. на устройстве | `Notification.permission` + `registration.pushManager.getSubscription()` | нет поддержки (старый браузер, iPhone без установки) → экраны 03/05 |
| пункты, курсы, Ruhezeit | на устройстве `orbook.push` (localStorage) — копия того, что отправлено на сервер | по умолчанию: 3 из 4 вкл. (`newExam` выкл.), «Meine Kurse», 21:00–06:30 |
| «Zuletzt: heute 07:14» | новое `GET /api/push/subscription?endpoint=` → `lastSentAt` | `null` → «Noch nichts angekommen» |
| «3 von 4 an» в Mehr | `orbook.push` | выкл. → «Aus» |
| Admin: число устройств, «Zuletzt gesendet» | новое `GET /api/admin/push` → `{devices, recent[]}` | 0 / пусто → «Noch keine» |

«Meine Kurse» уходят на сервер списком `nr` выбранных Wahl-курсов (`courses: ["141","147"]`); `null` = «Ganze Klasse». При смене «Meine Kurse» приложение отправляет подписку заново.

## Состояния
- Нет поддержки Push (`!("PushManager" in window)`): iPhone в Safari — экран 03; другой браузер — тот же вид с текстом «Dieser Browser kann keine Mitteilungen. Nimm Chrome, Edge, Firefox oder Safari.»
- `permission === "denied"` → экран 05. «Nochmal prüfen» перечитывает `Notification.permission`.
- Подписку удалил сервер (410 от сервиса push, админ выключил) → при открытии `GET /api/push/subscription` даёт 404 → приложение тихо подписывается заново, если разрешение есть.
- `features.push` выключен админом → пункт в Mehr скрыт, service worker уведомления не показывает.
- Офлайн → переключатели недоступны (серые), подпись «Mitteilungen ändern geht nur mit Internet».

## PWA (фронт)
- `public/manifest.webmanifest`: `name: ORBook`, `display: standalone`, `start_url: /woche`, `scope: /`, цвета из токенов `paper` (светлая), иконки PNG 192/512 + maskable 512 + `apple-touch-icon` 180 (рисуем из `favicon.svg`, логотип Soft). В `index.html` — ссылки и `apple-mobile-web-app-*`.
- `public/sw.js` (без Workbox, ~50 строк): **ничего не кэширует** (решение при сборке: офлайн-план уже хранит `offlineCache.js`, а кэш оболочки задерживал бы новую версию после выкладки; Chrome давно не требует fetch-обработчик для установки). `push` → `showNotification(title, {body, tag, data: {url}, icon, badge})`; `notificationclick` → открыть/сфокусировать окно с `url`. `skipWaiting` + `clients.claim`.
- Регистрация в `main.jsx` только в production-сборке.

## Бэкенд (в `/opt/orbook-be`; план ждёт «ок» владельца). Миграция 0013
1. **Ключи:** сервер создаёт пару P-256 сам при первом `GET /api/push/key` и хранит приватный ключ зашифрованным в `settings` (`internal.push.vapidPrivate`) — env не нужен (решение при сборке: так демо и прод получают свои ключи без ручной правки `orbook.env`). `orbook vapid-keys` показывает публичный, `--new` — новый (все подписки удаляются).
2. **Без новой библиотеки:** шифрование Web Push (RFC 8291, `aes128gcm`) и подпись VAPID (ES256) — через уже установленный `cryptography`, отправка — через `httpx` (как запросы к школе). `pywebpush` тянет `requests` и ещё три пакета; свой модуль ~120 строк с тестами по примерам из RFC.
3. **Таблицы (0013):** `push_subscriptions` (`endpoint` уникально, ключи `p256dh`/`auth`, `prefs` JSON, `courses` JSON|null, `quiet_from/to`, `created_at`, `last_sent_at`, `fail_count`, `class_epoch`); `push_sent` (`subscription_id`, `key` — например `plan:2026-11-13:<hash>`, `sent_at`; хранится 14 дней).
4. **API:** `GET /api/push/key` (публичный ключ), `PUT /api/push/subscription` `{subscription, prefs, courses, quiet}`, `GET /api/push/subscription?endpoint=` (`lastSentAt`), `DELETE /api/push/subscription`, `POST /api/push/test` (лимит раз в 30 с на подписку); админ — `GET /api/admin/push` (`devices`, последние 10 рассылок без endpoint), настройки `features.push`, `push.reminderTime` (`HH:MM`, по умолчанию `18:00`). Нужна сессия класса; смена пароля класса (эпоха) или выключенный код доступа удаляет подписки его устройств.
5. **Отправка** (`push/sender.py`, очередь в процессе): после новой версии плана (`plan/bus.py` — то же событие, что для Live) — `planTomorrow`/`cancelledToday` по изменившимся урокам с фильтром курсов (правило как в API: `course == null`, не `optional`, или `nr` в списке); после создания Test — `newExam`; планировщик раз в минуту — `reminder` и отложенные `cancelledToday` после Ruhezeit. TTL 12 ч, `Urgency: high` для `cancelledToday`, иначе `normal`; 404/410 → удалить подписку; 10 ошибок подряд → удалить.
6. **Datenschutz:** таблица подписок без имён и IP; `cleanup` удаляет подписки без успешной доставки 60 дней и `push_sent` старше 14 дней. Обновить `docs/DATENSCHUTZ.md` и `src/shared/datenschutz.js`.
7. `make lint test`, `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `docs/SPEC.md` §13, выкладка `scripts/update.sh` (бэкап → миграция → перезапуск) на демо; ключи VAPID для прода — при «на прод».

## Фронт (после бэкенда)
- `shared/utils/push.js` + тест: что умеет устройство (`pushSupport(navigator, window)` → `ok | ios-install | unsupported | denied`), `prefsSummary` («3 von 4 an»), `quietLabel`, `coursesForPush(courses, picked)` (`null`-поля курсов).
- `shared/api/push.js` (через `api.js`), `shared/store/pushStore.js` (Zustand, `orbook.push`), `shared/hooks/useInstallPrompt.js` (`beforeinstallprompt` с очисткой).
- `pages/Mitteilungen.jsx` + `components/push/` (`PushStatus`, `PushPrefs`, `QuietSheet`, `InstallSheet`, `InstallCard`); пункт в Mehr и в левом меню ПК; админка — блок в `AdminSettings`.
- Changelog, Datenschutz, `docs/PROGRESS.md`.

## Открытые вопросы владельцу
1. «ок дизайн?»
2. **Приватность:** чтобы приходили уведомления только по своим курсам, сервер хранит для каждого устройства адрес подписки браузера и список выбранных Wahl-курсов (без имён, без IP). Ок? (Иначе — только «Ganze Klasse».)
3. Какие уведомления и что включено сразу: 4 пункта как в макете (Plan morgen, fällt heute aus, Erinnerung um 18:00 — Tests **и** Hausaufgaben, Neuer Test — выкл.). Добавить/убрать?
4. «ок» плана бэкенда (миграция 0013, свой модуль Web Push без новой библиотеки, ключи VAPID на демо сейчас, на прод — при «на прод»).
