# 36b · Экран «Noten»

**Статус:** готово на демо (2026-11-20)
**Источники:** `design/neu/36-noten/` (handy-01…11, pc-01; «ок дизайн» 2026-11-20), `/opt/orbook-be/docs/API.md` «Noten», `docs/FRONTEND.md` часть 36, spec 36a.

## Экраны
| Макет | Адрес | Что |
|---|---|---|
| handy-04, 05 | `/noten` без данных | вход в InfoPoint: Benutzername, Passwort (с «глазом»), «Angemeldet bleiben», «Anmelden»; неверный пароль — красная рамка и «Benutzername oder Passwort falsch» |
| handy-01, pc-01 | `/noten` | «1. Halbjahr / 2. Halbjahr / Zeugnis», «Stand 16.09. · geholt 07:41», плитки Schnitt и Fehlzeiten, «Fächer», внизу «InfoPoint · логин · Abmelden» |
| handy-06 | `/noten` | серые плашки, пока идёт первая загрузка |
| handy-07 | `/noten` | розовая плашка «InfoPoint nicht erreichbar · Stand vom …» и «Nochmal» вместо строки Stand (оценки из кеша остаются) |
| handy-08 | `/noten` | тост «Gerade geholt – wieder in N Min.» (429 `too_often`) |
| handy-11 | `/noten` | «Abmelden?» → «Login und geholte Noten werden gelöscht.» |
| handy-02, pc-01 справа | `/noten/:fach` | предмет: карточка Schnitt цветом предмета, «Notenrechner», список оценок, «Nächster Test» |
| handy-03 | шторка | Notenrechner: «Mein Ziel» (−/+ по 0,1), «Nächste Note zählt ×1 / ×2», «Du brauchst 1,6 oder besser» |
| handy-09 | `/fehlzeiten` | Fehltage, Fehlstunden, unentschuldigt; «Einträge» |
| handy-10 | Start | блок «Noten»: Schnitt и последняя новая оценка |

На ПК (pc-01) `/noten` — слева обзор, справа выбранный предмет (первый, если не выбран) с Notenrechner прямо в колонке; полугодие — справа вверху.

## Данные
- `POST /api/noten/abrufen` `{username, password}` (`shared/api/noten.js`). Ответ целиком кладём в `notenStore` (localStorage `orbook.noten`) — это и есть кеш.
- **Логин:** «Angemeldet bleiben» вкл. → имя и пароль в localStorage этого устройства (никогда не в Sync); выкл. → только в памяти до перезагрузки. Без пароля кнопка обновления открывает вход (имя уже вписано).
- **Sync:** новая часть «Noten» в «Was wird synchronisiert» (по умолчанию вкл.): в блок идут **только оценки** (`noten: { value, updatedAt }`), побеждает более новое. «Abmelden» пишет `value: null` с новым временем → оценки стираются и на других устройствах.
- **«neu»:** после загрузки оценки, которых не было в прошлом кеше (первая загрузка — ничего не «neu»). Метка снимается, когда открыл предмет. Только на устройстве.

## Расчёты (`shared/utils/noten.js`, тесты рядом)
- Schnitt предмета = Σ value·weight / Σ weight по оценкам полугодия с `value` (`weight` `null` → 1). Нет оценок с `value` → «–».
- Общий Schnitt = среднее Schnitt предметов; «14 Noten · 7 Fächer» — оценки и предметы полугодия.
- Цвет: ≤ 2,5 зелёный (`ok`), > 3,5 красный (`danger`), между — `sand`.
- Notenrechner: нужно x = (Ziel·(W+k) − S)/k, показываем вниз до 0,1. x < 1 → «Mit einer Note nicht zu schaffen»; x ≥ 6 → «Schaffst du mit jeder Note». Ziel по умолчанию — текущий Schnitt − 0,1 (вниз до 0,1, не меньше 1,0); ×2 по умолчанию, если у предмета есть оценка ×2.
- Полугодие по умолчанию — 2, если есть оценки 2-го полугодия, иначе 1.
- Zeugnis: только `finals` школы — строка предмета «1. Hj. 2 · 2. Hj. –», справа последняя выставленная. Плитки Schnitt на Zeugnis нет (оценку ставит учитель).
- Fehlzeiten: числа из `summary` (`null` → считаем по спискам). Дни — «Ganzer Tag», часы — «N Stunden» / `amount`, предмет; `excused` `null` → без плашки.
- Tests: у прошедшей Klausur справа оценка, если в тот же день есть оценка того же предмета (имя совпадает/начинается одинаково или код InfoPoint = код плана).
- «Nächster Test» на предмете — ближайшая Klausur того же предмета (`useExams`), нет — строки нет.

## Ошибки
| Ответ | Что видно |
|---|---|
| `403 infopoint_denied` | handy-05 (на форме входа; если пришло при обновлении — форма входа с ошибкой) |
| `429 too_often` | тост «Gerade geholt – wieder in N Min.» (`details.retryAfter`) |
| `429 rate_limited` | тост «Gerade zu viele Anfragen – versuch es gleich nochmal» |
| `502`, сеть, офлайн | handy-07 (без кеша — та же плашка над формой входа) |
| `403 feature_disabled` | раздел пропадает (`features.noten` false) |

## Навигация
`SECTIONS.noten` и `fehlzeiten` — `feature: "noten"` (раньше `ready: false`). Блок «Noten» на Start — `feature: "noten"`, размер Klein.

## Чего здесь НЕТ
Android и уведомлений о новых оценках (36c); фонового обновления (только кнопка); changelog — при «на прод».

## Слова
- **Schnitt** — средний балл, только для себя; Zeugnis ставит учитель.
- **Wichtung** — сколько раз оценка «считается» (×1, ×2).
- **Кеш** — последний ответ InfoPoint на устройстве: видно без сети.

## Отличия от дизайна
- Имена предметов — как в InfoPoint («Mathematik»), кружок — код InfoPoint с большой буквы («Ma», «Wpf»).
- Подпись под Schnitt предмета: «4 Noten» и, если есть, «Doppelt zählt ×2» (`weightLabel` InfoPoint) вместо «Klassenarbeit zählt ×2» — вида работы в данных нет.

## Открытые вопросы
нет.
