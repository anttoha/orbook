# 50 · Wetter + «Für dich jetzt»

**Статус:** дизайн ок 2026-11-26 (владелец: «ок дизайн» + «в настройках можно выбрать ВСЁ, что у каждого своё»). Экраны настроек 13–15 и `pc-03` дорисованы после этого и ждут «ок». План бэкенда (§ Бэкенд) тоже ждёт «ок».
**Источники:** `design/neu/50-wetter/` (артефакт https://claude.ai/artifact/68wkQ4teKbiNLxVmWW9WJG); код частей 30 (Start-блоки, `BlockSheet`), 31d/39 (виджеты, `fit()`), 45 (`isDayDone`, «Abends schon morgen»), 26 (Live, `useSchoolNow`), 43/44 (свой Sync-блок на `sideBlock.js`).

## Зачем
Открыл приложение или посмотрел на виджет и сразу видишь, что нужно сейчас: во сколько выходить, что надеть и взять, что идёт и что дальше, что задано на завтра. Погода — у каждого дня в «Woche» и «Tag».

## Делим на три шага
| Шаг | Что | Бэкенд | APK |
|---|---|---|---|
| **50a** | погода: сервер, админка «Wetter», плашки «Woche», карточка «Tag», шторка «Wetter», Datenschutz | да | нет |
| **50b** | блок «Für dich jetzt» (+ блок «Wetter»), `nowFocus.js`, настройки «Für dich jetzt» + «Mitnehmen pro Fach», Sync | нет | нет |
| **50c** | виджеты Android «Für dich jetzt» и «Wetter», `/api/widget` с погодой, проверка всех 12 старых видов во всех размерах, демо-APK | маленький | да |

## Экраны
| Экран | Файлы дизайна | Шаг |
|---|---|---|
| Start с блоком | `handy-01-start`, `pc-01-start` | 50b |
| Блок по времени дня, Breit/Klein, блок «Wetter» | `handy-02-tageszeiten` | 50b |
| Шторка блока | `handy-03-block-einstellen` (+ строка «Alle Einstellungen ›») | 50b |
| Einstellungen «Für dich jetzt» | `handy-13-einstellungen`, `pc-03-einstellungen` | 50b |
| Mitnehmen pro Fach, «Neu bei …» | `handy-14-mitnehmen`, `handy-15-mitnehmen-neu` | 50b |
| Woche с погодой | `handy-04-woche`, `pc-02-woche` | 50a |
| Tag: карточка погоды | `handy-05-tag` | 50a |
| Шторка «Wetter» | `handy-06-wetter` | 50a |
| Admin · Wetter | `handy-07-admin-ort` | 50a |
| Состояния | `handy-08-zustaende` | 50a/50b |
| Виджеты | `handy-09…12` | 50c |

## Что куда нажимать
- **Woche:** третья строка плашки дня — значок + максимум °C. Нет прогноза на день (дальше 7 дней, выключено, нет места) — строки нет, высота плашки та же.
- **Tag:** карточка над уроками (только если есть прогноз на этот день) → шторка «Wetter»: макс/мин, дождь (с какого часа), ветер, «Losgehen HH:MM» с °C и плашками «что надеть», часы 07–14 (дождь ≥ 30 % — синим), «Stand HH:MM · Wetterdaten: Open-Meteo».
- **Admin → Einstellungen → Wetter:** «Wetter anzeigen» (вкл/выкл для всей школы), поиск города → список (город, регион, страна) → выбрать → превью сегодня → «Speichern». Ничего не найдено — «Kein Ort gefunden.»
- **Start:** блок «Für dich jetzt» (Klein/Breit/Groß), нажатие → `/day/<дата>` того дня, о котором блок. Шторка блока: размер, «Zeigen», «Losgehen vorher», «Nur meine Kurse», «Alle Einstellungen ›».
- **Mehr → Seiten → «Für dich jetzt»** (`/fuer-dich`): все настройки (ниже). «Pro Fach ›» → `/fuer-dich/mitnehmen`: по карточке на свой предмет, плашки вещей с ×, «+ Neu» → шторка «Mitnehmen» (поле + «Oft gebraucht» для предмета).
- ПК: Einstellungen и Mitnehmen — одна страница в две колонки.

## Что показывает блок — `shared/utils/nowFocus.js`
Чистая функция `nowFocus({ now, days, weather, homework, exams, appointments, settings })` → `{ kind, day, … }`. Порядок проверки:
1. `ferien` — сегодня каникулы (Termin-тип Ferien или нет учебных дней ≥ 3 подряд с Termin) → сколько дней, «Schule wieder …», первый тест/задание после.
2. `morgen` — учебный день, до первого своего урока: время выхода = начало 1-го урока − `leaveMinutes`; «los in N min» (уже прошло — «los!»); погода к выходу (час выхода); «что взять» (ниже); первые уроки + изменения на сегодня.
3. `stunde` — идёт урок: предмет, кабинет, учитель, «noch N min», полоска; «Danach» — 2 следующих; внизу дождь сегодня, если будет.
4. `pause` — между уроками: «Gleich HH:MM», предмет, кабинет крупно (изменён — «Raum X statt Y»), «Danach».
5. `nachmittag` — уроки кончились, до `eveningFrom` (по умолчанию 17:00): «Für morgen»: Hausaufgaben на завтра (до 3), уроки завтра с изменениями, тесты завтра; погода завтра в шапке.
6. `abend` — после `eveningFrom`, выходные, свободный день: следующий учебный день (как `isDayDone` из 45): первый урок, задания и тесты до этого дня, изменения; погода того дня.
Нет загруженного плана нужного дня — показываем то, что есть (Muster, если включён), без пустых строк. Тесты на каждый отрезок дня — в `nowFocus.test.js`.

**Что взять** (`packList`): по своим урокам дня — вещи из «Mitnehmen pro Fach» (дубли убираем); тест в этот день и «Am Testtag erinnern» → плашка «Test: <Fach>»; погода к выходу/за школьные часы → Wetter-Tipps по порогам. Порядок: погода, тесты, предметы.

## Настройки (только устройство + Sync, свой блок на `sideBlock.js`, часть «Für dich jetzt» в «Was wird synchronisiert»)
`orbook.fuerDich` = `{ leaveMinutes: 45 (5…120, шаг 5), eveningFrom: "17:00" (14:00…22:00, шаг 30 мин), show: { wetter, mitnehmen, hausaufgaben, tests, aenderungen: true, termine: false }, onlyMine: true, tips: { regenjacke: 50 (%, 10…90 или null = Aus), jacke: 12, muetze: 3, sonnencreme: 6 (UV) или null }, testReminder: true, items: { "<Kurs-/Fachcode>": ["Sportsachen", …] } }`.
По умолчанию в `items` — только Sport → «Sportsachen». Вещь — до 40 символов, до 10 на предмет. «Oft gebraucht» — маленький список подсказок по предмету в `shared/constants/packHints.js` (Sport, Kunst, Mathe, Musik, Englisch/Sprachen, Naturwissenschaften; остальное — общие). Блок и виджет читают одни и те же настройки; шторка блока меняет те же поля.

## Погода на клиенте
- `shared/api/weather.js`: `GET /api/weather` (через `api`, `conditional: true`), кеш в `offlineCache` (офлайн — последний ответ, «Stand gestern 21:30»).
- `shared/utils/weather.js`: код WMO → значок (sun / cloud-sun / cloud / fog / rain / snow / storm), `dayOf(weather, date)`, `hourAt(day, "07:05")`, `rainFrom(day)` («ab 13 Uhr»), `weatherTips(hours, settings.tips)` — всё с тестами, все поля могут быть `null`.
- Значки — lucide (`Sun`, `CloudSun`, `Cloud`, `CloudRain`, `CloudFog`, `CloudSnow`, `CloudLightning`, `Droplet`, `Wind`, `Umbrella`, `Shirt`, `Backpack`, `DoorOpen`, `MapPin`) — совпадают с макетами.
- Загрузка — skeleton в карточке/блоке; ошибка или 204 — погоды просто нет, без текста.

## Бэкенд (`/opt/orbook-be`, ждёт «ок» владельца)
1. **Настройки школы** (scope `school:<id>`, `appsettings.py`): `weather.enabled` (bool, по умолчанию false), `weather.place` (`{name, region, country, lat, lon, timezone}` или null). Видны в `GET/PATCH /api/admin/settings`.
2. **`GET /api/admin/weather/places?q=…`** (админ, ≥ 2 символа, лимит частоты): сервер спрашивает Open-Meteo Geocoding (`geocoding-api.open-meteo.com/v1/search?name=…&count=5&language=de`), отдаёт до 5 мест. Ничего не найдено — `[]`.
3. **`GET /api/weather`** (любой вошедший): прогноз места школы на 7 дней — `{ place: {name}, updatedAt, days: [{ date, code, tMax, tMin, rainMax, rainFrom, windMax, uvMax, hours: [{ hour, temp, code, rain }] /* 06–18 */ }] }`. Выключено/нет места — `204`. ETag/304 как у плана.
4. **Кеш на сервере:** таблица/строка `weather_cache` на школу (JSON + `fetched_at`), обновление не чаще раза в 30 мин по запросу (без фонового таймера); сервис недоступен — отдаём старый кеш (до 24 ч) с его `updatedAt`, старше — `204`. Таймаут 5 с, без ретраев в запросе.
5. **`/api/widget`** (50c): поле `weather` — сегодня и завтра в коротком виде (`code, tMax, tMin, rainMax, rainFrom, hours`).
6. Наружу уходят только координаты школы (и название города при поиске админом). Ни IP, ни данные учеников. Open-Meteo — бесплатно, без ключа, некоммерческое использование; указание источника (CC BY 4.0) — строкой в шторке.
7. `make lint test`, тесты: парсинг ответа Open-Meteo (фикстура), кеш (свежий / старый / слишком старый), 204, права админа на поиск; `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`; выкладка `scripts/update.sh`.

## Datenschutz (50a)
Раздел «Wetter»: погода берётся с Open-Meteo **сервером ORBook** для города школы; твоё устройство с Open-Meteo не связывается, твой IP и место туда не уходят. Сервер хранит последний прогноз до 24 ч. Настройки «Für dich jetzt» (50b) — только на устройстве и в Sync (зашифрованно), как Karteikarten. EN/UK.

## Тексты (немецкий, в `t()`, EN/UK в словари)
Für dich jetzt, Für dich, Für morgen, Nächster Schultag, los in {n} min, los!, Losgehen {time}, Heute bis {t}°, Regen ab {h} Uhr, Danach, Gleich · {time}, Raum {r}, Raum {a} statt {b}, Hausaufgaben, {n} offen, bis morgen, {n} Tage frei, Schule wieder {date}, Wetter, Wetter anzeigen, Ort der Schule, Kein Ort gefunden., Vorschau · heute, Stand {time}, Wetterdaten: Open-Meteo, Schultag, Regenjacke, Jacke, Mütze & Schal, Sonnencreme, Sportsachen, Test: {Fach}, Zeigen, Was mitnehmen, Änderungen, Termine, Nur meine Kurse, Losgehen vorher, Vor der 1. Stunde, Abends schon morgen, ab {time}, Wetter-Tipps, ab {n} %, unter {n}°, UV ab {n}, Aus, Mitnehmen, Pro Fach, {n} Fächer, Am Testtag erinnern, Neu, Hinzufügen, Oft gebraucht, Alle Einstellungen.

## Проверки
- Юнит-тесты: `weather.js`, `nowFocus.js` (каждый отрезок дня, нет плана, каникулы, выходные), `packList`, настройки (границы степперов), Sync-блок.
- Сверка скриншотами с макетами (`/root/work/orbook-compare/50-wetter/`), светлая/тёмная, телефон/ПК.
- 50c: скриншоты всех 14 видов виджета во всех размерах — ничего не обрезано посередине.
- `npm run lint`, `npm test`, `npm run build`; демо; прод — только по «на прод».
