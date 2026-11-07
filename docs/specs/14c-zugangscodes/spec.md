# 14c · Zugangscodes

**Статус:** ждёт «ок» плана бэкенда
**Источники:** `design/neu/14c-zugangscodes/` (дизайн ок 2026-11-07, буква `A`), ответы владельца 07.11 (`docs/PROGRESS.md`), бэкенд `/opt/orbook-be/src/orbook/` (`api/auth.py`, `api/deps.py`, `security/accounts.py`, `security/editor_codes.py`, `api/admin_codes.py`), `docs/API.md`.

## Зачем
Сейчас вся класс входит по одному паролю: если он утёк, админ меняет его, и выкидывает всех сразу. Zugangscodes — много кодов входа: личные (один на ученика) и групповые («Eltern», «Vertretung»). Каждый со сроком, лимитом устройств, его можно выключить — и выйдут только его устройства.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Список | `handy-01-liste`, `pc-01-liste` | карточки/таблица кодов + строка «Klassenpasswort · ALT» |
| Пусто, загрузка | `handy-07-leer`, `handy-08-laden`, `pc-07-laden` | только Klassenpasswort + «Ersten Code erstellen»; skeleton |
| Новый код | `handy-02-neu`, `handy-03-neu-fertig`, `pc-02/03-neu*` | Bezeichnung, Für wen, Geräte, Gültig bis → код один раз |
| Действия | `handy-04-aktionen`, `pc-04-aktionen` | Umbenennen, Geräte-Limit, Gültigkeit, Geräte abmelden, Neu erzeugen, Sperren, Löschen |
| Sperren? + тост | `handy-05/06`, `pc-05/06` | вопрос с числом устройств, тост после |
| Вход ученика | `handy-09/10/11`, `pc-08-limit-voll` | поле «Zugangscode oder Klassenpasswort», «Limit voll», «Du wurdest abgemeldet» |
| Einstellungen | `handy-12-einstellungen` | карточка «Zugang»: Zugangscodes · Admin-Passwort |

## Что куда нажимать
- ПК: меню «Zugangscodes» (вместо «Passwörter»). Телефон: Einstellungen → «Zugang» → «Zugangscodes»; «Übersicht → Schnell» → «Zugangscodes».
- «+» / «Neuer Code» → форма → «Code erstellen» → фиолетовая карточка с кодом, «Kopieren», «Fertig».
- Переключатель в карточке — вкл/выкл. Выключение — сначала вопрос «… sperren?».
- Три точки → действия. «Löschen», «Geräte abmelden», «Neu erzeugen» — с вопросом.
- Строка «Klassenpasswort»: переключатель включает/выключает вход по старому паролю; три точки → «Passwort ändern» (ведёт на страницу «Admin-Passwort / Klassenpasswort», часть 14b) и «Geräte abmelden».
- «Admin-Passwort» — старая страница 14b (`/admin/passwoerter`), в Einstellungen строкой «Admin-Passwort».

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Список кодов | `GET /api/admin/access-codes` → `codes[]` | пустой массив → экран «Leer» |
| Название | `label` | нет |
| Gruppe / Persönlich | `audience`: `group` \| `person` | нет |
| ••••-QM | `codeHint` | нет |
| «9 von 30 Geräten» | `devices`, `maxDevices` | `maxDevices: null` = «unbegrenzt» |
| «bis 31. Juli» / abgelaufen | `validUntil`, `status` (`active` \| `locked` \| `expired`) | нет |
| zuletzt … | `lastUsedAt` | `null` → «noch nie» |
| Klassenpasswort | `classPassword`: `enabled`, `devices`, `changedAt`, `lastUsedAt` | `changedAt`, `lastUsedAt` → `null` → без подписи / «noch nie» |
| Новый код | `POST` → `code` (полный, один раз) | нет |

## Состояния
- Загрузка: skeleton (как в 14b).
- Офлайн / ошибка: `AdminError` с «Erneut versuchen» (как другие разделы админки).
- Пусто: только строка Klassenpasswort + приглашение создать первый код.
- Особые случаи:
  - Лимит уменьшили ниже числа устройств — вошедшие остаются, новые не войдут (подпись «voll»).
  - Срок прошёл — код сам перестаёт работать, его устройства при следующем запросе получают 401.
  - Выключить Klassenpasswort, пока нет ни одного активного кода, нельзя — сервер вернёт 409 `last_access` (иначе никто не войдёт, кроме учителей).
  - Ученика выкинули → на экране входа «Du wurdest abgemeldet · Dein Zugang gilt nicht mehr» (фронт знает, что раньше был вход).

## Бэкенд (нужен, в `/opt/orbook-be`)
1. **Миграция `0009_access_codes`:** таблица `access_codes` (`id`, `label` ≤40, `code_hash` unique, `suffix` 2, `audience` person|group, `max_devices` int|null, `valid_until` date, `active`, `created_at`, `last_used_at`); в `auth_sessions` колонка `access_code_id` (FK, `ON DELETE CASCADE`). Отдельная таблица, а не `editor_codes`: тогда список Editor-Codes и его счётчики не меняются.
2. **Коды:** формат `ORB-A-XXXX-XXXX` (как Editor-Code: 40 бит, Crockford, HMAC с отдельным ключом `access-code`, видны 2 последних знака). Бессрочных нет (как у Editor-Codes): срок обязателен, по умолчанию `school.yearEnd`.
3. **Вход `POST /api/auth/login`** (то же поле `password`): если ввод похож на код — ищем код; не нашли — проверяем пароль класса. Ошибки: `wrong_password` (как сейчас, считает попытки), `code_locked`, `code_expired`, **`code_full`** 403 (`details.devices`, `details.maxDevices`), **`password_disabled`** 403, если пароль класса выключен. Сессия: `kind=class`, `access_code_id`, без `class_epoch`.
4. **Проверка сессии (`load_class_context`):** сессия с кодом не зависит от пароля класса; код выключен / истёк / удалён → сессия удаляется, 401. Сессии по паролю — как сейчас + 401, если пароль выключен.
5. **Смена пароля класса** выкидывает только устройства, вошедшие по паролю (раньше — все). Вход по паролю пишет `internal.classPasswordLastUsedAt`.
6. **Админ-API** `/api/admin/access-codes`: `GET` (список + `classPassword`), `POST` (создать → полный код один раз), `PATCH /{id}` (`label`, `maxDevices`, `validUntil`, `active` — при выключении устройства выходят, ответ `signedOut`), `POST /{id}/regenerate`, `POST /{id}/sign-out` (выйти всем устройствам кода), `DELETE /{id}`; `PATCH /class-password` (`enabled`), `POST /class-password/sign-out`. Всё — в протокол («Zugangscode erstellt/gesperrt/gelöscht», без кода).
7. Документация: `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `SPEC.md` §7, тесты (`make lint test`).

## Фронт
- `pages/AdminAccessCodes.jsx`, части в `components/admin/access/` (карточка, строка таблицы, форма, шторка действий), API в `shared/api/`, логика (тексты «9 von 30 Geräten», статус, срок «Halbjahr», распознавание ошибок входа) — `shared/utils/accessCodes.js` с тестом.
- Переиспользуем: `CodeReveal`, `DangerDialog`, `Sheet`, `Segmented`, `CodeMenu`.
- Вход (`AuthPage`): подпись поля, плейсхолдер `ORB-A-XXXX-XXXX`, тексты новых ошибок, плашка «Du wurdest abgemeldet».
- Меню: `/admin/zugang` «Zugangscodes» вместо «Passwörter» на ПК; Einstellungen/Übersicht — ссылки.

## Чего здесь НЕТ
- Приглашения ссылкой/QR — часть 16 «Einladen».
- Списка отдельных устройств кода (только число): устройства не хранят ничего, кроме сессии, — так меньше данных.
- Бессрочных кодов.

## Отличия от дизайна
- Код длиннее, чем в макете: `ORB-A-4KX9-T2QM` (8 знаков, как Editor-Code), а не 6 — так безопаснее.
- Текст при выходе — «Dein Zugang gilt nicht mehr» вместо «Dein Zugangscode …»: тот же экран бывает и после смены пароля класса.
- «Halbjahr» = до 31. Januar (если сегодня уже после — до конца учебного года); считает фронт и шлёт дату.

## Слова
- **Zugangscode** — код входа в приложение (смотреть план), не путать с Editor-Code (право вносить Klausuren).
- **Сессия** — запись на сервере «это устройство вошло»; cookie в браузере ссылается на неё.
- **Лимит устройств** — сколько сессий одного кода может быть одновременно.
- **HMAC/хэш** — в базе лежит «отпечаток» кода, по нему код нельзя восстановить.
- **Миграция** — скрипт, который добавляет новую таблицу в базу без потери данных.

## Открытые вопросы
- [ ] «ок» владельца на план бэкенда (п. 1–7) — владелец.
