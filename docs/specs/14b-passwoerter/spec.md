# 14b · Admin · Passwörter

**Статус:** в работе (дизайн ок 2026-11-06)
**Источники:** `design/neu/14b-passwoerter/` (артефакт https://claude.ai/artifact/Fv6TA6PNVUuUL3d9ULCCGp), `/opt/orbook-be/docs/API.md` (Admin → `class-password`, `admin-password`), `/opt/orbook-be/docs/frontend/09-admin.md`, бэкенд `api/admin_settings.py`, `security/accounts.py`, `security/crypto.py` (2026-11-06).

## Зачем
Админ меняет оба пароля в одном месте: пароль класса (свой или придуманный сервером) и свой пароль админа. Раньше пароль класса был карточкой в «Einstellungen», а пароль админа менялся только на сервере.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Passwörter | `handy-01-passwoerter`, `pc-01-passwoerter` | пароль класса (поле, «Erzeugen», «Passwort ändern»), пароль админа (текущий + новый) |
| Erzeugen? | `handy-02-erzeugen-fragen`, `pc-02-erzeugen-fragen` | окно-вопрос: все устройства класса выйдут |
| Neues Passwort | `handy-03-erzeugt`, `pc-03-erzeugt` | фиолетовая карточка «nur jetzt sichtbar», копировать, «Für die Klassengruppe kopieren», «Fertig» |
| Admin-Passwort falsch | `handy-04-admin-falsch`, `pc-04-admin-falsch` | красная рамка и «Noch 4 Versuche» |
| Gespeichert | `handy-05-gespeichert`, `pc-05-gespeichert` | тост «Admin-Passwort geändert · 1 Gerät abgemeldet» |
| Laden | `handy-06-laden` | скелет |
| Вход | `handy-07-einstellungen`, `handy-08-uebersicht`, `pc-06-einstellungen` | ссылки на раздел из Einstellungen и Übersicht |

## Что куда нажимать
- Адрес `/admin/passwoerter`. ПК: пункт меню «Passwörter» после «Lehrer-Codes». Телефон: подстраница с кнопкой «назад» (без нижнего меню, как Protokoll); попасть — из «Einstellungen» (карточка «Passwörter») и из «Übersicht → Schnell → Passwörter».
- **Klassenpasswort:**
  - ввести пароль → «Passwort ändern» → окно «Klassenpasswort ändern?» → «Ändern» → тост «Passwort geändert · N Geräte abgemeldet»;
  - «Erzeugen» → окно «Passwort erzeugen?» → «Erzeugen» → вместо поля фиолетовая карточка с паролем. Значок копирования — только пароль; «Für die Klassengruppe kopieren» — готовый текст для чата класса (адрес сайта + пароль). «Fertig» убирает карточку, пароль больше нигде не виден.
- **Admin-Passwort:** «Aktuelles Passwort» + «Neues Passwort» → «Admin-Passwort ändern» → тост «Admin-Passwort geändert · N Geräte abgemeldet» (или «… geändert», если других устройств не было), поля очищаются. Окна-вопроса нет: это устройство остаётся в системе.
- У каждого поля пароля «глаз» — показать/скрыть набранное.

## Данные
| На экране | Откуда (запрос → поле) | Может быть пустым? |
|---|---|---|
| «Seit 10. Sept · vor 12 Tagen» | `GET /api/admin/settings` → `classPasswordChangedAt` → `classPasswordText(…).since/.ago` | да (`null`) → подпись скрыть |
| Смена пароля класса | `POST /api/admin/class-password {password}` → `{devicesSignedOut, password: null}` | — |
| Erzeugen | `POST /api/admin/class-password {generate: true}` → `{devicesSignedOut, password}` | `password` есть только в этом ответе; хранится только в состоянии страницы |
| Смена пароля админа | `POST /api/admin/admin-password {currentPassword, newPassword}` → `{otherSessionsEnded}` | — |
| Ссылка в Einstellungen / Übersicht | `classPasswordChangedAt` из settings / overview | да → без подписи |

После смены пароля класса перезагружаем settings и overview (дата «seit heute»).

## Состояния
- Загрузка: скелет, пока нет ответа `GET /admin/settings` (нужна только дата).
- Офлайн / ошибка загрузки: `AdminError` с «Erneut versuchen» (как на других страницах админки).
- Ошибки пароля класса: короче 10 знаков — проверяем сами до запроса «Mindestens 10 Zeichen.»; `422` с сервера — его текст под полем.
- Ошибки пароля админа:
  - пустые поля — кнопка ничего не отправляет, фокус на пустое поле;
  - новый короче 12 знаков — «Mindestens 12 Zeichen.» под новым полем, без запроса;
  - `403 wrong_password` — под «Aktuelles Passwort»: «Passwort stimmt nicht. Noch N Versuche.» (`details.attemptsLeft`), это тот же лимит, что у входа админа;
  - `429 locked` — `retryText`, кнопка выключена на `retryAfter`;
  - `422 validation_error` (`newPassword`) — текст сервера под новым полем.
- Пусто: не бывает (оба пароля есть всегда, иначе в админку не войти).
- Особые случаи: пока видна карточка с новым паролем, поле пароля класса и «Erzeugen» скрыты. Уход со страницы — карточка пропадает (пароль не сохраняем ни в store, ни в `localStorage`).

## Бэкенд
Не нужно: `POST /api/admin/class-password` (с `generate`) и `POST /api/admin/admin-password` уже есть и выложены.

## Чего здесь НЕТ
- Сброса забытого пароля админа — только на сервере (`orbook set-admin-password`).
- Числа устройств ДО смены: API его не даёт, поэтому в вопросе «alle Geräte», точное число — после.
- Истории смен паролей (она в «Protokoll»).

## Отличия от дизайна
- В оригинале Soft (45/47) пароль класса — карточка в «Einstellungen»; теперь там ссылка на «Passwörter» (решение части 14b, дизайн ок).
- Тексты ошибок берём у сервера и общих функций (`adminLoginErrorText`), поэтому формулировка «Passwort stimmt nicht. Noch 4 Versuche.» чуть отличается от макета («·» вместо точки).

## Слова
- **Hash** — «отпечаток» пароля: по нему сервер проверяет пароль, но сам пароль восстановить нельзя.
- **Erzeugen** — сервер сам придумывает пароль `xxxx-xxxx-xxxx` (12 знаков, без похожих букв).
- **devicesSignedOut / otherSessionsEnded** — сколько устройств сервер вывел из системы после смены.
- **Лимит входа админа** — 5 неверных паролей подряд → пауза 30 минут; ошибки на этой странице тоже считаются.

## Открытые вопросы
- нет
