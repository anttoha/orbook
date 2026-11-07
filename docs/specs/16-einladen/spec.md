# 16 · Einladen (Link + QR)

**Статус:** готово (2026-11-07), на демо
**Источники:** `design/neu/16-einladen/` (дизайн ок 2026-11-07, QR «красивее» — точки, фиолетовые глаза, логотип), часть 14c (`docs/specs/14c-zugangscodes/spec.md`), бэкенд `/opt/orbook-be/src/orbook/` (`api/auth.py` `_login_with_code`, `security/access_codes.py`, `security/crypto.py` `encrypt_secret`, `api/admin_access.py`), `docs/API.md` (Zugangscodes), фронт `src/pages/More.jsx`, `src/components/auth/*`, `src/components/sheets/ShareSheet.jsx`.

## Зачем
Сейчас новому ученику надо продиктовать код `ORB-A-…`. Приглашение — короткая ссылка и QR: открыл, нажал «Beitreten», и он в классе. Админ может показать QR на проекторе (Elternabend), а ученики — поделиться ссылкой в классной группе.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Действия кода + «Einladen» | `handy-01-aktionen`, `pc-01-menue` | первая строка/пункт «Einladen» у группового кода |
| Einladen (админ) | `handy-02-einladen`, `handy-03-kopiert`, `handy-07-laden`, `pc-02/03` | QR, ссылка, Kopieren/WhatsApp, QR groß, «Link aktiv», «Mitschüler dürfen teilen», «Neuen Link erzeugen» |
| QR на весь экран | `handy-04-gross`, `pc-04-gross` | большой QR, ссылка, «Link kopieren» |
| Новый link? / Link aus | `handy-05/06`, `pc-05/06` | вопрос перед заменой; бледный QR с «Link ist aus» |
| Ученик | `handy-08-mehr`, `handy-09-schueler-einladen`, `handy-10-schueler-aus`, `pc-07/08` | строка «Klasse einladen», шторка/окно с QR, «Einladen ist gerade aus» |
| Открыл ссылку | `handy-11..14`, `pc-09/10` | «Klasse 9b» + «Beitreten», загрузка, «Link gilt nicht mehr» (+ поле кода), «Kein Platz mehr» |

## Что куда нажимать
- **Админ:** Zugangscodes → ⋮ у кода «Gruppe» → «Einladen». Если ссылки ещё нет — она создаётся при первом открытии (одна на код). «Kopieren» копирует полную ссылку, «WhatsApp» открывает `wa.me` с текстом «Hier ist der ORBook-Link für die 9b: …» (как в `ShareSheet`). «QR groß zeigen» — экран на весь экран, экран не гаснет (Wake Lock, если браузер даст). «Link aktiv» — вкл/выкл. «Mitschüler dürfen teilen» — эта ссылка видна ученикам в «Mehr». «Neuen Link erzeugen» → вопрос → новая ссылка, старая не работает.
- У кода «Person» строки «Einladen» нет (ссылка для одного человека — это просто код).
- **Ученик / учитель:** Mehr → «Klasse einladen» (ПК: Einstellungen → карточка и пункт меню) → шторка/окно с QR и кнопками.
- **Кто открыл `/i/K7MQ-2XPA`:** видит название класса и «Beitreten» → вход → дальше как после обычного входа (первый раз — «Welche Kurse hast du?»). Уже вошёл в этот класс → сразу `/woche`.

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Ссылка у кода (админ) | `GET /api/admin/access-codes` → `codes[].invite` | `null` — ссылки ещё нет |
| токен, вкл, для учеников | `invite.token`, `invite.active`, `invite.shared` | нет |
| Метка LINK в списке | `invite?.active` | — |
| Ссылка для ученика | `GET /api/invite` → `token`, `className` | 404 `invite_off` → «Einladen ist gerade aus» |
| Экран «Beitreten» | `GET /api/public/invite/{token}` → `className`, `full` | 404 `invite_invalid` → «Link gilt nicht mehr»; `className` может быть `null` → «deine Klasse» |
| Вход | `POST /api/auth/join` `{token}` → как `/auth/login` | ошибки ниже |

Полную ссылку собирает фронт: `location.origin + "/i/" + token` — без домена в коде (правило `CLAUDE.md`), на демо и проде своя.

## Состояния
- Загрузка: шторка админа — skeleton QR и строк (`handy-07`); «Beitreten» — skeleton карточки, кнопка неактивна (`handy-12`).
- Офлайн: QR и ссылка админа/ученика берутся из последнего ответа (кэш в памяти); без сети «Beitreten» показывает обычную ошибку сети «Keine Verbindung — nochmal versuchen».
- Ошибка: админка — `AdminError` «Erneut versuchen», как другие разделы.
- Пусто: у ученика нет общей ссылки → «Einladen ist gerade aus» + путь через Zugangscode.
- Особые случаи:
  - `code_full` (403) → «Kein Platz mehr: 30 von 30 Geräten» (`details.devices`, `details.maxDevices`).
  - Код выключен/истёк (`code_locked`, `code_expired`) или ссылка выключена/заменена (`invite_invalid`) → «Dieser Link gilt nicht mehr» + поле «Zugangscode oder Klassenpasswort» (тот же `LoginForm`).
  - Слишком много неверных ссылок с одного адреса → `too_many_attempts` (общий счётчик попыток входа класса) → текст как на экране входа.
  - Выключили код/ссылку — вошедшие по ссылке: код выключен → выходят (как в 14c); выключили только ссылку или заменили её → остаются.

## Бэкенд (нужен, в `/opt/orbook-be`) — **ждёт «ок» владельца**
1. **Миграция `0010_invite_links`:** в `access_codes` колонки `invite_hash` (HMAC токена, unique, null), `invite_secret` (токен, зашифрованный `encrypt_secret(…, "invite")`, null), `invite_active` (bool), `invite_shared` (bool). Отдельная таблица не нужна: одна ссылка на код. Токен храним зашифрованным, а не только хэшем — админ должен видеть QR снова; сам код по-прежнему виден один раз.
2. **Токен:** 8 знаков Crockford (40 бит, как код), показ `K7MQ-2XPA`. Только для `audience=group` (иначе 422 `invite_person`).
3. **Публично:** `GET /api/public/invite/{token}` → `{className, full}` или 404 `invite_invalid` (ссылка выключена/заменена, код выключен/истёк/удалён). Неверный токен считается неудачной попыткой входа (`start_attempt(request, "class")`, как `/auth/login`) — перебор не работает.
4. **Вход:** `POST /api/auth/join` `{token}` → тот же путь, что вход по коду (`_login_with_code`: лимит устройств, сессия с `access_code_id`). Ошибки: `invite_invalid` 404, `code_full` 403, `too_many_attempts` 429. В протокол: «Beitritt per Einladungslink» (без токена).
5. **Ученик:** `GET /api/invite` (сессия класса или учителя) → `{token, className}` общей ссылки (`invite_shared` и `invite_active`, код рабочий) или 404 `invite_off`. Общая ссылка одна: включение «Mitschüler dürfen teilen» у одного кода выключает у остальных.
6. **Админ:** в `GET /api/admin/access-codes` у каждого кода `invite: {token, active, shared} | null`. `POST /api/admin/access-codes/{id}/invite` → создать или заменить (новый токен; старый сразу не работает) → `{invite}`. `PATCH /api/admin/access-codes/{id}/invite` `{active?, shared?}` → `{invite}`. Удаление кода удаляет и ссылку (колонки той же строки). «Neu erzeugen» кода ссылку не меняет. Протокол: «Einladungslink erstellt / ersetzt / ausgeschaltet / für Schüler freigegeben».
7. `make lint test` (тесты: вход по ссылке, лимит, выключение, замена, `shared` один, публичный 404 и счётчик попыток), `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, `SPEC.md` §7. Выкладка — `scripts/update.sh` (прод и демо, миграция 0010).

## Фронт
- **QR:** матрицу считает библиотека `uqr` (маленькая, без зависимостей, MIT; уровень коррекции Q). Рисуем сами — `components/ui/QrCode.jsx` (SVG: точки, фиолетовые глаза, логотип), чтобы вид совпадал с дизайном. Логика «какие клетки рисовать» (без глаз и центра) — `shared/utils/qr.js` с тестом. Перед выкладкой проверить сканирование настоящей камерой телефона (iOS и Android).
- **Токены:** `--color-qr-bg`, `--color-qr-ink`, `--color-qr-eye` — одинаковые в `@theme` и `.dark` (QR всегда тёмный на белом).
- **Админ:** `components/admin/access/InviteSheet.jsx` (шторка/окно), строка «Einladen» в `accessActions.js`, метка LINK в `AccessCard`/`AccessTable`, API в `shared/api/admin.js`.
- **Общее:** `components/invite/InviteCard.jsx` (QR + ссылка + Kopieren/WhatsApp) — и для админа, и для ученика; `components/invite/QrFullscreen.jsx` (Wake Lock с очисткой в `useEffect`).
- **Ученик:** строка «Klasse einladen» в `More.jsx`, карточка в `SettingsTiles`, пункт в меню Einstellungen; `shared/api/invite.js`.
- **Ссылка:** маршрут `/i/:token` вне проверки входа → `pages/JoinPage.jsx` (на основе `AuthPage`/`AuthAside`), `errorElement` как везде. Тексты ошибок — в `shared/utils/invite.js` с тестом (в т.ч. `className: null`).

## Чего здесь НЕТ
- Приглашений для учителей (у них Lehrer-Code, часть 14).
- Срока у самой ссылки: она живёт, пока жив код (срок кода — Schuljahresende) и пока включена.
- Счётчика «сколько вошли по ссылке» отдельно от кода (видно общее число устройств кода).
- Печатного листа с QR (браузер в окне артефакта не печатает; в приложении — потом, если попросят).

## Отличия от дизайна
- Строка «Klasse einladen» в «Mehr» — в карточке «Klasse» (рядом с «Materialien»), а не над «Klasse verlassen»: в приложении эта карточка уже есть (часть 15), в макете Soft её ещё не было.
- В макете «Mitschüler dürfen teilen» — у каждой ссылки; в коде общая ссылка для учеников одна (включил у одной — у другой выключится), иначе непонятно, какую показывать ученику.
- Ссылка на демо — `orbook-demo.orbitium.net/i/…` (берётся из адреса сайта).

## Слова
- **Einladungslink / приглашение** — короткая ссылка `/i/XXXX-XXXX`, которая работает как групповой Zugangscode, только без ввода.
- **Токен** — случайная часть ссылки (`K7MQ-2XPA`); по нему сервер находит код.
- **QR-код** — та же ссылка картинкой для камеры телефона.
- **Уровень коррекции Q** — QR можно прочитать, даже если четверть картинки закрыта (поэтому логотип в центре не мешает).
- **Wake Lock** — просьба к браузеру не гасить экран, пока открыт большой QR.
- **Шифрование токена** — в базе токен лежит зашифрованным ключом сервера: без ключа из `/etc/orbook/orbook.env` его не прочитать.

## Открытые вопросы
- [x] «ок» владельца на план бэкенда — получен 07.11 («ок, делай всё»).
- [ ] Проверить сканирование QR настоящей камерой (iPhone и Android) — владелец, на демо.

## Сделано (2026-11-07)
- Бэкенд (`/opt/orbook-be` 675ccfa): миграция 0010, `security/invites.py`, `api/invite.py`, админ-API; выложен на прод и демо.
- Фронт: `ui/QrCode.jsx` + `utils/qr.js` (uqr, уровень Q, точки, глаза, лого), `invite/InviteCard.jsx`, `invite/QrFullscreen.jsx` (Wake Lock), `admin/access/InviteSheet.jsx`, пункт «Einladen» и метка LINK, `sheets/ClassInviteSheet.jsx` (`?sheet=einladen`), строка в «Mehr», плитка и пункт меню в Einstellungen, `pages/JoinPage.jsx` (`/i/:token`), `planStore.join`.
- Отличия: окно на ПК 620px (новый токен `--container-dialog-qr`, как в макете); у «Mehr» строка в карточке «Klasse»; в «Kein Platz mehr» без чисел, если ссылка проверена заранее (`full: true` без деталей).
- Проверка QR: большой QR из приложения декодирует OpenCV в обеих темах; маленький OpenCV не берёт (он же не читает и скруглённые «глаза» вообще) — нужна проверка камерой.
- Скриншоты: `/root/work/orbook-compare/16-einladen/shots/`, скрипт `_tools/einladen.mjs`.

- 07.11 (владелец): «Einladen» и у личных кодов («Person»): ссылка считается в их лимит; «Mitschüler dürfen teilen» — только у групповых (`422 invite_person`). Релиз v0.8.1.
