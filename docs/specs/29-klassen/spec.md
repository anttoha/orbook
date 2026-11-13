# 29 · Mehrere Klassen und Schulen

**Статус:** дизайн v2 и план бэкенда — «ок» владельца 2026-11-13. 29a (бэкенд) — готово на демо 13.11 (`/opt/orbook-be` `5774ae6`); 29b (фронт «Meine Klassen») — готово на демо 13.11; 29c («Nebeneinander» + админка) — готово на демо 13.11; дальше 29d.
**Источники:** `design/neu/29-klassen/` (генератор `gen.py`, обзор `index.html`), идея владельца 10.11 (`docs/ideas/2026-11-11/ideas.md`: «при заходе удобный экран, где можно добавить несколько классов… кнопка возле класса, там все нужные настройки»), пожелание 13.11: «школы тоже можно добавлять», `/opt/orbook-be/docs/SPEC.md` §949 («ещё один класс — отдельный инстанс» — это решение заменяется).

## Зачем
Одно устройство — несколько классов: свой 9b, 5a младшего брата, класс из другой школы. Сейчас один сервер знает ровно один класс одной школы. После этой части сервер держит несколько школ и классов, а приложение показывает их рядом и переключается одним нажатием. Бот в Telegram тоже остаётся один на всех.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Meine Klassen · Karten | `handy-01-klassen`, `handy-06-drei-klassen`, `pc-01-klassen` | карточка на класс: значок класса в его цвете, имя на устройстве, школа, «сегодня одной строкой» (клетка на урок: зачёркнуто = fällt aus, точка = Vertretung), главное одной фразой, ближайший тест. На ПК в карточке ещё и весь день списком — классы видно рядом |
| Meine Klassen · Nebeneinander | `handy-02-nebeneinander` | один день, классы колонками (до 3), уроки строками; дни недели сверху |
| Klasse hinzufügen | `handy-03-hinzufuegen`, `handy-04-gefunden`, `handy-05-code-falsch` | поле Zugangscode (код сам говорит, какая школа и класс), «QR-Code scannen», найденный класс, имя на устройстве → дальше обычный выбор курсов (Soft 03) |
| Klasse einstellen | `handy-07-klasse-einstellen` | имя, цвет, Meine Kurse, Mitteilungen, Tests eintragen (Editor-Code), «Beim Start öffnen», «Klasse entfernen» |
| Переключатель | `handy-08-woche`, `handy-09-wechsler`, `pc-02-wechsler` | чип «9b ⌄» в шапке (ПК — рядом с логотипом): мои классы, «Alle Klassen», «Klasse hinzufügen» |
| Zugang beendet | `handy-10-zugang-beendet` | код класса выключили: карточка с «Neuen Code eingeben» / «Entfernen», остальные классы работают |
| Загрузка | `handy-11-laden` | скелет карточек |
| Admin · Schulen & Klassen | `handy-12-admin-klassen`, `pc-03-admin-klassen` | школы карточками, в каждой — её классы (устройства, коды, тесты), «Code für neue Klasse», «Schule hinzufügen» |
| Admin · Schule hinzufügen | `handy-13-admin-schule-neu`, `pc-04-admin-schule-neu` | имя, Schulnummer, Passwort der Schule, Server (как карточка «Schule & Plan»), «Verbindung testen» → «24 Klassen im Plan» |
| Admin · новый код | `handy-14-admin-code-klasse`, `handy-15-admin-klasse-waehlen` | в форме любого кода — поля «Schule» и «Klasse» (список из плана школы, с поиском); нового класса ещё нет → «8a ist neu – die Klasse entsteht mit diesem Code» |
| Admin · лимит | `handy-17-admin-limit` | Einstellungen → «Klassen pro Gerät»: Unbegrenzt (по умолчанию) / 1 / 2 / 3 / 5 / 10 |
| Право «Klasse verwalten» | `handy-18-recht-klasse-verwalten`, `handy-19-klasse-verwalten` | галочка у Lehrer- и Editor-Code (по умолчанию выкл.); с ней в Mehr появляется «Klasse verwalten» — Zugangscodes и приглашения только своего класса |
| Admin · переключатель | `handy-16-admin-wechsler` | чип класса вместо «Admin · 9b»: вся остальная админка (коды, тесты, Muster, Kanäle, Einstellungen) относится к выбранному классу |

## Что куда нажимать
- Первый вход — как сейчас: Zugang (Soft 01) → код → Kurse wählen → Woche. Один класс на устройстве — приложение выглядит как раньше, плюс чип класса в шапке.
- Чип «9b ⌄» → другой класс (одно нажатие) или «Alle Klassen» → экран «Meine Klassen» (`/klassen`).
- На «Meine Klassen»: карточка → план этого класса; ползунки на карточке → настройки класса; «+» или пунктирная карточка → «Klasse hinzufügen».
- Два и больше классов: при запуске открывается «Meine Klassen», если ни у одного класса не включено «Beim Start öffnen».
- Ссылка-приглашение (`/i/…`) и QR на устройстве, где уже есть класс, добавляют ещё один, а не заменяют.
- «Klasse entfernen» — диалог как Soft 28 «Klasse verlassen»; последний класс → экран Zugang.
- Админ: Übersicht → чип класса → «Schulen & Klassen verwalten»; на ПК — пункт меню «Schulen & Klassen».

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Список моих классов | `GET /api/me` → **новое** `classes[] {id, name, school {id, name}, role, canEdit}` | нет (иначе 401 → Zugang) |
| Имя, цвет, порядок, «Beim Start» | только устройство (`classesStore`, localStorage) + Sync-блок | имя пустое → показываем «Klasse 9b» |
| Сегодня одной строкой, статус | `GET /api/day?date=` для каждого класса (заголовок класса, см. ниже); кеш офлайн по классу | `not_published` → «Noch kein Plan für heute»; свободный день → «Heute frei» |
| Ближайший тест | `GET /api/exams` класса, с учётом Meine Kurse | нет тестов → строки нет |
| Найденный класс по коду | `POST /api/auth/login` → `class {id, name, school}` | ошибки: `wrong_code`, `code_full`, **новое** `already_member`, `too_many_classes` |
| Школы и классы (админ) | **новое** `GET /api/admin/schools` | школ нет не бывает (первая создаётся миграцией) |
| Классы из плана школы | **новое** `GET /api/admin/schools/{id}/classes` (из последнего скачанного файла) | план ещё не скачан → «Zuerst Zugang testen» |

## Состояния
- Загрузка: скелет карточек; план каждого класса грузится отдельно — одна медленная карточка не держит остальные.
- Офлайн: карточки из кеша с плашкой Offline (как Soft 32), добавлять класс нельзя («Dafür brauchst du Internet»).
- Ошибка одного класса: на карточке «Plan kommt gerade nicht an» + «Nochmal»; остальные работают.
- Код класса выключен/истёк: карточка «Zugang beendet» (`handy-10`).
- Особые случаи: тот же класс второй раз → «Diese Klasse hast du schon»; лимит классов на устройстве (если админ его задал) → «Mehr als N Klassen gehen auf einem Gerät nicht»; учитель (Lehrer-Code) — тоже членство в классе, может иметь и ученический доступ к другому.

## Бэкенд (план — нужен «ок» владельца, делается в `/opt/orbook-be`)
Сейчас по классу разделён только план (`plan_days`, `plan_versions`, `courses`, `lesson_times` имеют `class_name`). Всё остальное общее. Что меняем:

1. **Схема 0014.** Новые таблицы `schools` (имя, Schulnummer, Benutzername, пароль зашифрован, baseUrl, yearEnd) и `classes` (school_id, name). Миграция создаёт школу № 1 и класс № 1 из нынешних настроек `school.*` — у существующих пользователей ничего не меняется. Колонка `class_id` (по умолчанию 1) добавляется в: `access_codes`, `editor_codes`, `exams`, `homework`, `materials`, `appointments`, `events` (Protokoll), `push_subscriptions`, `push_sent`, `push_log`, `holidays`; таблицы плана получают `school_id` рядом с `class_name`. `sync_blobs` не трогаем (Sync-Code — про устройство, не про класс).
2. **Настройки.** Три уровня: сервер (`security.*`, бэкапы), школа (`school.*`, `plan.*` — опрос), класс (`courses.*`, виды тестов, `muster.*`, `channels.*`, `push.*`, `homework.*`, `appointments.*`, `materials.*`). В таблице `settings` появляется `scope` (`server` / `school:<id>` / `class:<id>`).
3. **Сессия и членства.** Cookie остаётся одна. Новая таблица `session_classes` (session_id, class_id, access_code_id, editor_code_id, kind, class_epoch): одно устройство — несколько членств. `POST /api/auth/login` с кодом при уже существующей сессии **добавляет** членство. `POST /api/auth/leave {class}` убирает одно. Выключенный код убирает только своё членство.
4. **Какой класс в запросе.** Все эндпоинты класса принимают заголовок `X-ORBook-Class: <id>` (для потока `GET /api/plan/stream` — параметр `?class=`; поток один на устройство, события помечены классом). Без заголовка — первый класс сессии: старый фронт на проде продолжает работать без изменений.
5. **Опрос школы.** Цикл по школам: файл дня скачивается один раз на школу и разбирается для каждого её класса (файл stundenplan24 уже содержит все классы). Частота и лимиты — прежние на школу.
6. **Админка.** `GET/POST/PATCH/DELETE /api/admin/schools`, `POST /api/admin/schools/{id}/test`, `GET /api/admin/schools/{id}/classes`, `DELETE /api/admin/classes/{id}`. Отдельного создания класса нет: `POST` кодов (Zugangs-, Lehrer-, Editor-Code) принимает `schoolId` + `className` и создаёт класс, если его ещё нет (имя должно быть в плане школы). Все остальные `/api/admin/*` получают тот же выбор класса. Удаление класса — как Gefahrenzone: слово LÖSCHEN + пароль, бэкап перед удалением.
7. **Старый пароль класса** остаётся только у класса № 1 (по паролю нельзя понять, какой класс). Новые классы — только по Zugangscode.
8. **Telegram и Push.** Чат и подписка привязаны к коду → к классу; один чат может вести несколько классов, в сообщении первой строкой «9b · …». Бот остаётся один.
9. **Демо:** второй класс из тех же файлов-фикстур, чтобы всё можно было проверить без школы.
10. **Право «Klasse verwalten»** (`can_manage_class` у `editor_codes`, по умолчанию выкл.): `GET/POST/PATCH/DELETE /api/class/access-codes` и приглашения — те же правила, что у админских, но только свой класс и без Klassenpasswort; `me.canManageClass`.
11. **Лимит** `classes.maxPerDevice` (уровень сервера, `null` = без лимита): проверяется при добавлении членства → `too_many_classes`; уже добавленные классы не отбираются.
12. Документация: `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `docs/BETRIEB.md` («ещё один класс / школа» — теперь в админке), `docs/SPEC.md` §949.

## Фронт (после бэкенда)
- `classesStore`: список классов устройства (id, имя, цвет, порядок, стартовый), активный класс. `api.js` сам добавляет `X-ORBook-Class`.
- Настройки по классу: `userStore` (Meine Kurse, скрытые курсы, заметки), `planStore`, `tasksStore`, `pushStore`, кеши офлайн — получают ключ класса; при первом запуске новой версии старые данные переезжают в класс № 1 (тест на миграцию).
- Общие для устройства остаются: тема, язык, Darstellung, Fachfarben, Sync-Code.
- Sync-блок: новая часть `klassen` (имя, цвет, порядок, курсы по классу). **Zugangscodes в блок не кладём** — на новом устройстве класс добавляется своим кодом.
- Экраны: `pages/Klassen.jsx` + `components/klassen/` (карточка, строка дня, «Nebeneinander», шторки), `ui/ClassChip`, админка `pages/AdminSchools.jsx`.
- Цвет класса — из тех же токенов, что Fachfarben; новых hex нет.
- Тексты — сразу в `t("…")` и в оба словаря.
- Datenschutz: несколько школ и классов, что хранит сервер о членстве (без имён). Changelog.

## Порядок работы (каждая под-часть — отдельный чат)
| № | Что | Модель |
|---|---|---|
| 29a | Бэкенд: схема 0014, членства, выбор класса в запросе, настройки по уровням, опрос по школам, совместимость со старым фронтом; демо | Opus · effort high |
| 29b | Фронт: `classesStore`, переезд настроек по классам, «Meine Klassen» (карточки), добавить/убрать класс, настройки класса, переключатель, ПК | Opus · effort high |
| 29c | «Nebeneinander» + админка «Schulen & Klassen», чип класса в админке, поля «Schule/Klasse» у кодов, лимит, «Klasse verwalten» | Opus · effort medium |
| 29d | Mitteilungen и Telegram по классам, Sync `klassen`, Datenschutz, changelog, проверка на демо | Opus · effort medium |

## Чего здесь НЕТ
- Отдельных админов у каждого класса (см. вопрос 1).
- Сведённой недели нескольких классов в одной сетке — только день рядом.
- Виджетов (часть 31) и перетаскивания блоков (часть 30).
- Общих между классами тестов, материалов и терминов.

## Решения при постройке 29a (бэкенд, 13.11)
- Настройки школы (Schulnummer, Server, пароль школы) лежат в `settings` с уровнем `school:<id>`, а не колонками таблицы `schools` (там — только имя): тот же `set_settings`, меньше кода.
- Класс запроса — `X-ORBook-Class`; сервер кладёт класс в сессию базы, и все запросы к таблицам класса фильтруются сами (`db.py`, `tenancy.py`).
- «Klasse hinzufügen» — `POST /api/auth/login` с `"add": true` (без `add` тот же класс просто входит заново — как раньше). Ошибки: `409 already_member`, `403 too_many_classes`; на запросы класса — `403 class_gone` (код выключили), `403 not_member`.
- Класс № 1 и школа № 1 не удаляются (у класса № 1 — Klassenpasswort).
- Новые классы и школы в админке: `GET/POST/PATCH/DELETE /api/admin/schools`, `POST /api/admin/schools/test` (до сохранения), `POST /api/admin/schools/{id}/test`, `GET /api/admin/schools/{id}/classes`, `DELETE /api/admin/classes/{id}`; у кодов — `schoolId` + `className`, право `manageClass`; «Klasse verwalten» — `/api/class/access-codes*`.
- Telegram-чат пока ведёт один класс — несколько классов в одном чате делаются в 29d.

## Решения при постройке 29b (фронт, 13.11)
- Экраны ничего не знают о классах: у открытого класса заметки, «Meine Kurse», «Alle Kurse» и `checkedPlan` лежат в `userStore` сверху, у остальных — в `userStore.byClass[id]`; переключение меняет их местами (`swapClassData`, тест в `classes.test.js`). Тема, язык, Darstellung и Fachfarben — общие для устройства.
- Переезд старого устройства: при первом запуске новой версии всё, что уже лежит на устройстве, принадлежит классу из `me.class` (он же «домашний» `homeId`).
- `api.js` сам добавляет `X-ORBook-Class` (кроме входа, админки и Sync); кеш офлайн и «Neuer Plan» — по классу; поток Live — `?class=`.
- Sync-блок до 29d: заметки и курсы — только «домашнего» класса, в другом классе эти части не трогаются (иначе заметки смешались бы).
- «Klasse entfernen» стирает копию планов класса, заметки класса остаются на устройстве (как у «Klasse verlassen»).
- «Klasse verlassen» в Mehr при нескольких классах убирает только открытый класс.

- Доработки по просьбе владельца (13.11): Mitteilungen у каждого класса свои (`pushStore` сверху + `byClass`, подписка на сервере — на класс; браузерная подписка отменяется, только если ни у одного класса Mitteilungen не включены) — перенесено из 29d; на страницах Meine Kurse / Mitteilungen / Editor-Code строка «Klasse 8b», когда классов несколько; в «Klasse einstellen» значения видны у любого класса; поле «Klasse» в форме нового Zugangscode (из 29c, чтобы можно было выдать код для 8b); при смене класса экран не пустеет; анимации спокойнее (без отскоков, сдвиг ≤ 8px, 120–240 мс — правило в `index.css`); на ПК значок класса без стрелки, «Demo» — в меню классов.

## Решения при постройке 29c (фронт, 13.11)
- Админка выбирает класс сама: `adminStore.classId` (на устройстве, `orbook-admin-class`), `api.js` ставит его в `X-ORBook-Class` у всех `/admin/*`, кроме `/admin/auth`, `/admin/schools`, `/admin/classes` (уровень сервера; класс из чипа мог быть только что удалён). Смена класса пересоздаёт страницу (`Outlet key`) — данные прошлого класса не мелькают.
- Цвет значка класса в админке — по номеру класса (`adminClassList`), одинаковый в чипе, меню и «Schulen & Klassen».
- Поля «Schule/Klasse» — у Zugangs-, Editor- и Lehrer-Code (`SchoolClassField`). Свой класс из чипа — запрос без `schoolId/className`; другой или новый — с ними. У Lehrer-Code Kürzel грузятся из плана выбранного класса; класс новый — Kürzel вручную.
- «Klasse verwalten» (`/mehr/klasse-verwalten`) — те же карточки и окна, что у админа: `AccessScope` подставляет запросы `/class/access-codes` вместо `/admin/access-codes`.
- «Nebeneinander» — только на телефоне (на ПК карточки и так стоят рядом и показывают весь день); выбор дня Mo–Fr, нажатие на урок открывает день в его классе, внизу ближайший тест всех классов.
- Удалить школу можно только пустую (кнопка в окне школы), удалить класс — ⋮ на ПК (LÖSCHEN + пароль, бэкап).

## Решения при постройке 29d (13.11)
- Sync-блок: новая часть `klassen` — `{ [classId]: { notes, kurse, info } }` (`info` = имя на устройстве, цвет, порядок). Zugangscodes не кладём. Верхние `notes`/`kurse` — копия «домашнего» класса для старых версий приложения; блок без `klassen` (старый) читается как данные «домашнего» класса, блок с `klassen` — верхние поля уже не читаются. Класс, которого нет на устройстве, остаётся в блоке нетронутым. Отметки времени курсов и имени — у каждого класса (`stamps.klassen`). Переключатель «Meine Klassen» в «Was wird synchronisiert». Чистые функции и тест — `shared/utils/syncPayload.js`.
- Telegram: в базе уже можно (уникальность `endpoint + class_id`), но бот ведёт чат как один класс. План бэкенда — в `docs/PROGRESS.md` (29d), ждёт «ок».

## Отличия от дизайна
- «Klasse hinzufügen»: класс добавляется уже на «Weiter» (у сервера нет отдельной проверки кода), «Code gilt bis …» не показываем — срок кода в ответе входа не приходит.
- «QR-Code scannen» не открывает камеру в приложении (её нет), а подсказывает: QR — это ссылка, обычная камера телефона откроет ORBook и добавит класс.
- На ПК стрелки «‹ Heute ›» у «Meine Klassen» нет: карточки всегда за сегодня; «Nebeneinander» — только на телефоне.
- Таблица школ на ПК без колонок «Telegram» и «Seit» — этих чисел сервер в `/admin/schools` не отдаёт. Плашка «Plan ok» значит «список классов школы известен» (у сервера нет отдельного статуса опроса по школам).
- На телефоне «Klasse löschen» нет — только на ПК (⋮), как подписано в макете.

## Слова
- **Членство** — запись «это устройство вошло в этот класс этим кодом»; имён в ней нет.
- **Schulnummer** — номер школы на stundenplan24.de, вместе с Benutzername и паролем открывает её план.

## Ответы владельца (2026-11-13)
1. Админ — только владелец. У класса могут быть свой учитель и/или староста (Lehrer-Code, Editor-Code этого класса).
2. Школы добавляет только владелец: у каждой свой Schulnummer и пароль (как нынешняя карточка «Schule & Plan»: Schulnummer, Passwort der Schule, Server; поля Benutzername нет). **Класс выбирается у каждого кода** при его создании (школа → класс из плана школы).
3. Klassenpasswort остаётся только у нынешнего класса (Petrischule 8a); все остальные входы — по кодам.
4. Sync-Code не переносит Zugangscodes.
5. Лимитов по умолчанию нет; сколько классов можно на устройстве — настройка владельца в админке (Einstellungen).

## Открытые вопросы (решает владелец)
- [x] A. Учитель и староста: записи **и** право «Klasse verwalten» галочкой (ответ 13.11: «да» на оба).
- [x] B. Отдельного шага «Klasse anlegen» нет — класс появляется с первым кодом (ответ 13.11: «да»).
- [x] «ок дизайн» для v2 и «ок» плана бэкенда — 2026-11-13.
