# 13 · Admin

**Статус:** готово (2026-11-06)
**Источники:** дизайн «39–46 Admin · …» (телефон), «41–49 Admin · …» (ПК), утверждённый `design/neu/13-admin-kurse/` («Kurse und Fächer», ок 2026-11-06); `/opt/orbook-be/docs/frontend/09-admin.md`, `docs/API.md` → «Вход админа», «Admin»; пример `docs/examples/admin-client.js`; настройки в коде бэкенда `src/orbook/appsettings.py` (2026-11-06).

## Зачем
Владелец ORBook управляет классом без сервера и командной строки: смотрит, работает ли опрос плана, выдаёт Editor-Codes, чистит Klausuren, меняет пароль класса и настройки.

## Экраны
| Экран | Дизайн телефон / ПК | Адрес |
|---|---|---|
| Admin · Login | 39 / 41 | любой `/admin…` без входа админа |
| Übersicht | 40 / 42 | `/admin` |
| Editor-Codes | 41 / 43 | `/admin/codes` |
| Neuer Code | 42 / 44 (окно) | окно поверх Editor-Codes |
| Code-Aktionen | 43 (шторка) / 45 (меню «⋮») | поверх Editor-Codes |
| Alle Klausuren | 44 / 46 | `/admin/klausuren` |
| Kurse und Fächer | `design/neu/13-admin-kurse` | `/admin/kurse` |
| Protokoll | 46 / 49 | `/admin/protokoll` |
| Einstellungen | 45 / 47 | `/admin/einstellungen` |
| Löschen bestätigen | — / 48 (окно) | поверх Einstellungen и Klausuren |

## Что куда нажимать
- В приложении: ПК — «Admin» внизу сайдбара, телефон — Mehr → «Admin». Админка — **отдельная ветка адресов** вне приложения класса (своя cookie `orbook_admin`, свой вход, своё меню): вход класса ей не нужен.
- Телефон: снизу своё меню из 4 вкладок (Übersicht, Codes, Klausuren, Einstellungen). Protokoll и Kurse & Fächer открываются из «Schnell» на Übersicht, у них кнопка «назад». «Abmelden» — кнопка справа от заголовка Übersicht.
- ПК: свой сайдбар (ORBook ADMIN, 6 пунктов, карточка «Plan läuft», «Zur App», «Abmelden»).
- Übersicht: «Plan jetzt neu laden», ссылки «Schnell», «Alle» → Protokoll. ПК: «Neuer Editor-Code» открывает окно на странице Codes.
- Editor-Codes: «+» → окно «Neuer Code» (Bezeichnung, Rechte, Gültig bis) → «Code erzeugen» → код показывается **один раз** + «Kopieren» → «Fertig». Переключатель в строке = Sperren/Entsperren. «⋮» → Umbenennen, Rechte ändern, Gültigkeit, Neu erzeugen, Sperren, Löschen (каждое — маленькое окно или подтверждение).
- Klausuren: вкладки Kommend/Vergangen, поиск (ПК), карандаш → окно правки, корзина → удаление с «Rückgängig», «Alte löschen» → окно Gefahrenzone с датой.
- Kurse und Fächer: Pflicht/Wahl у каждого курса, названия предметов, «Zählen ab» → «Änderungen speichern».
- Einstellungen: «Passwort ändern» (с подтверждением: все устройства выйдут), «Verbindung testen», переключатели и списки → «Änderungen speichern» (на телефоне кнопка появляется внизу, когда есть изменения). Gefahrenzone: 3 кнопки → окно со словом LÖSCHEN и паролем админа.
- Protokoll: фильтры Alles/Plan/Fehler/Codes, поиск (ПК), «Mehr laden».

## Данные
| На экране | Откуда | Пусто? |
|---|---|---|
| Вход | `GET /admin/auth/me` (401 → Login), `POST /admin/auth/login`, `POST /admin/auth/logout` | — |
| Класс в шапке «Admin · 9b» | `GET /public/info` → `className` | `null` → просто «Admin» |
| Карточка плана | `overview.plan`: `status.lastOkAt`, `status.nextFetchAt`, `consecutiveErrors`, `lastError`, `hours[24]` | времена бывают `null` → «Noch nie geladen», `hours[].status` `null` → серый столбик |
| «Server … · 32 Klassen · 0 Fehler in 24 Std» | `settings.school.baseUrl` (только хост), `GET /admin/plan/classes` → длина, `hours` с `error` | нет данных → часть строки не показываем |
| Плитки | `overview.counts.examsUpcoming`, `editorCodesActive`, `syncBlocks` | — |
| «Klassenpasswort · vor 12 Tagen» | `overview.classPasswordChangedAt` | `null` → без подписи |
| Speicher (в дизайне нет) | `overview.storage` | `diskLow` → красный текст |
| Letzte Aktivität / Protokoll | `overview.events` / `GET /admin/events?kind=&q=&before=` → `title`, `detail`, `ts`, `level` | `detail` бывает пустым; `nextBefore: null` → без «Mehr laden» |
| Codes | `GET /admin/codes` → `label`, `masked`, `rights`, `validUntil`, `status`, `lastUsedAt`, `examCount` | `lastUsedAt` `null` → «noch nie»; `validUntil` `null` → «—» |
| Klausuren | `GET /admin/exams?scope=…&q=` → `date`, `type`, `subject`, `lesson`, `topic`, `createdBy`, `createdAt` | `subject` `null` → «Ohne Fach»; `lesson` `null` → «—»; `createdBy` `null` → «unbekannt» |
| Einstellungen | `GET/PATCH /admin/settings`, `POST /admin/plan/test-connection`, `POST /admin/class-password` | `school.number` `null` → пустое поле |
| Kurse | `GET /api/admin/courses` (без входа класса), `settings.courses.optional`, `settings.subjects.names`, `settings.stats.since` | `group` `null`; `parallelWith` `null` → «läuft parallel»; `defaultName` `null` → «Kein Name — „TW“» |

## Решения (технические, принял сам)
- Сохранение настроек — как `saveSettings` из примера: в `PATCH` уходит только изменённое, 422 → подсветить поля из `details.fields`.
- Срок нового кода: «30 Tage», «Schuljahresende» (по умолчанию), «Datum». **«Immer» нет** — решение владельца из `09-admin.md`.
- Пароль класса — минимум **10** символов (так проверяет сервер), а не 8 из макета.
- «Zugang Schüler/Lehrer» и пресеты «Std/Z1/Z2/Eigen» убраны (решение владельца 11.10.2026): одно поле «Server».
- Демо-сервер (`overview.demo`): поля доступа к школе выключены с подписью «Im Demo-Betrieb gibt es keinen Schulzugang».
- Gefahrenzone: слово LÖSCHEN **и** пароль админа; вместо «Das lässt sich nicht rückgängig machen» — «Vorher wird automatisch ein Backup angelegt»; после — тост с именем бэкапа.
- **Kurse und Fächer:** курсы и предметы — из `GET /api/admin/courses` (бэкенд сделан после «ок» владельца, коммит `9c4a5ee` в `/opt/orbook-be`). Вход класса не нужен. Группа → «Gruppe SpJu», параллельный → «parallel zu …», у обоих плашка «Immer Wahl».
- Названия предметов: в поле — текущее название (встроенное или от админа). Изменили — уходит в `subjects.names`; стерли своё — ключ удаляется, снова встроенное.
- Правка Klausur в админке — окно (Art, Datum, Stunde, Thema) с `If-Match`, предмет не меняется (у админки нет списка предметов класса). 409 → «Die Klausur wurde inzwischen geändert», список перезагружается.

## Состояния
- Загрузка: серые плашки (Skeleton) на месте карточек и таблиц.
- Офлайн или ошибка: текст ошибки и «Erneut versuchen». Кеша в админке нет (так в документации).
- Пусто: «Noch keine Editor-Codes», «Keine Klausuren», «Keine Einträge».
- 401 в любой момент → снова Admin · Login.
- Вход: `wrong_password` → «Noch N Versuche», `locked` → кнопка выключена на `retryAfter`, `503 not_configured` → «Das Admin-Passwort ist noch nicht gesetzt.»

## Бэкенд
Для экранов 39–49 не нужен. Для «Kurse und Fächer» добавлен `GET /api/admin/courses` (владелец дал «ок», выложен 2026-11-06).

## Чего здесь НЕТ
- Смена пароля админа (`/admin/admin-password`): в дизайне её нет.
- Новая Klausur из админки («+ Neu» в макете 46): в API нет `POST /admin/exams`.
- Список удалённых Klausuren: восстановить можно только через «Rückgängig» в тосте.
- Остальные настройки без дизайна (`exams.types`, `sync.inactiveDays`, `logs.retentionDays` …).

## Отличия от дизайна
- «Neuer Code» на телефоне — шторка снизу, а не отдельная страница (одна форма с окном на ПК).
- Kurse & Fächer на телефоне — строка в «Schnell» (в меню из 4 вкладок места нет).
- «Gültig bis» в таблице — дата («31. Juli») или «abgelaufen»: сервер отдаёт дату, а не выбранный вариант.
- «Protokoll · 24 Std» в «Schnell» — без числа: сервер его не отдаёт.
- Тексты протокола берём с сервера как есть (в макете только примеры).
- Строка «Speicher» на Übersicht — новая (её просит документация).
- «Zählen ab» — системное поле даты, а не пилюля «22. Sept».

## Слова
- **Editor-Code** — код, с которым можно вносить Klausuren; выдаёт админ, полный код виден только один раз.
- **masked** — хвост кода («••••-Q7»), по нему код узнают в списке.
- **Gefahrenzone** — действия, которые удаляют данные всего класса; перед ними сервер сам делает бэкап.
- **Pflicht / Wahl** — обязательный курс виден всем; курс по выбору каждый включает в «Meine Kurse» сам.
- **overview** — сводка для главного экрана админки, одним запросом.
- **PATCH** — запрос «поменяй только эти поля».

## Открытые вопросы
Нет.
