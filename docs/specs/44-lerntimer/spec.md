# 44 · Lerntimer (Pomodoro)

**Статус:** готово на демо (2026-11-22; дизайн ок 2026-11-22, владелец: «с анимациями очень прикольными»)
**Источники:** `design/neu/44-lerntimer/` (артефакт https://claude.ai/artifact/HnhgpxaXwKCCfk5xEUj34R), Soft 19 «Statistik», 22 «Mehr»; код частей 43 (Karteikarten: второй Sync-блок, Start-блок, navLayout) и 31e (будильники Android).

## Зачем
Ученик садится учить: выбирает предмет, жмёт «Start», 25 минут учится, 5 отдыхает. Время по предметам видно в «Statistik» — понятно, сколько реально выучено за неделю.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Lerntimer · bereit | `handy-01-bereit`, `pc-01-lerntimer` | предмет, кольцо 25:00, точки раундов, 25/5 · 50/10 · Eigene, Start, «Heute» |
| läuft / pausiert | `handy-02-laeuft`, `handy-03-pausiert` | плашка предмета, кольцо тает, «fertig um …», Pause/Weiter, Stopp |
| Pause | `handy-04-pause` | зелёное кольцо, «Pause überspringen» |
| Runde geschafft | `handy-05-geschafft` | шторка: минуты, раунды, «N min Pause» / «Fertig für heute» |
| Timer stoppen? | `handy-06-stoppen` | окно-вопрос (минуты всё равно засчитываются) |
| Einstellungen | `handy-07-eigene-zeiten` | Lernen, Pause, Lange Pause, Runden; Ton, Vibration, Pause von selbst starten |
| Start | `handy-08-start` | блок «Lerntimer» |
| Statistik | `handy-09-statistik` | раздел «Lernzeit» сверху |

## Что куда нажимать
- Mehr → Seiten → «Lerntimer» (`/lerntimer`); можно вынести в нижнюю панель («Untere Leiste», ключ `lerntimer`).
- Поле предмета (то же, что Karteikarten, 19c) — только до старта. «Ohne Fach» тоже можно (предмет `null`).
- «25 / 5», «50 / 10» — готовые режимы; «Eigene» и кнопка с ползунками — шторка «Einstellungen».
- «Start» → фокус. «Pause» → таймер стоит («PAUSIERT», «seit N min»), «Weiter». «Stopp» → «Timer stoppen?».
- Конец фокуса: звук + вибрация (если включены), шторка «Runde geschafft!». «N min Pause» — перерыв; после последнего раунда — «Lange Pause». «Fertig für heute» — назад в «bereit».
- «Pause von selbst starten» включено — перерыв начинается сам, шторки нет (вместо неё тост «Runde geschafft»).
- Конец перерыва: звук, экран «bereit» со следующим раундом — следующий фокус только по «Start».
- ПК: пробел — Pause/Weiter/Start, Esc — Stopp.
- Блок на Start: идёт — остаток и полоска, нажатие → `/lerntimer`; не идёт — «heute 1 h 15 min» и «Starten».

## Данные
Сервер не нужен: всё на устройстве (`lerntimerStore`, `orbook.lerntimer`) + Sync.
| На экране | Откуда | Пустое? |
|---|---|---|
| Остаток | `run: { phase, code, startedAt, pausedAt, pausedMs, round, focusMin, pauseMin }` — считаем от времени старта, не счётчиком | `run = null` — не идёт |
| Heute / Lernzeit | `sessions: [{ id, code, start, min, updatedAt }]` | пусто → раздел «Lernzeit» скрыт, «Heute» скрыт |
| Режим и настройки | `settings: { preset, focus, pause, long, rounds, sound, vibrate, autoPause }` | по умолчанию 25/5/15, 4 раунда, звук и вибрация вкл. |
| Название предмета | `subjectName(code)` как в Karteikarten; нет такого курса — код как есть, `null` — «Ohne Fach» | да |

Расчёты (чистые функции, `shared/utils/lerntimer.js` + тест): остаток, конец фазы, засчитанные минуты, «heute», по дням недели, по предметам, неделя/месяц, сравнение с прошлой неделей.

## Sync
Отдельный зашифрованный блок, как у Karteikarten (часть 43): `syncId = SHA-256("orbook-lerntimer-v1|" + основной syncId)`, ключ и шифрование — эталон без изменений. Блок `{ sessions, settings: { value, updatedAt } }`; сессии сливаются по id (`mergeNotes`), настройки — новее побеждает. Сессии старше 400 дней выкидываем; если блок всё равно больше 48 КБ — выкидываем самые старые. Блок заводится только когда есть хоть одна сессия. Часть Sync «Lerntimer» — переключатель в «Was synchronisieren» рядом с «Karteikarten». Идущий таймер (`run`) не синхронизируется.

## Состояния
- Загрузка/офлайн/ошибка: нет (всё локально).
- Вкладка закрыта и открыта снова: остаток из `startedAt`; если фаза уже кончилась — сессия засчитывается, показывается «Runde geschafft» (без звука, раз пропустили).
- Меньше 1 минуты — не засчитываем. Минуты = целые прошедшие (без пауз).
- Пусто: «Heute» и «Lernzeit» скрыты; блок Start — «Noch nichts gelernt» + «Starten».

## Android-App
Мост `ORBookAndroid.timerAlarm(json)` / `timerCancel()`: точный будильник на конец фазы (как «Vor der Stunde»), уведомление канала «Lerntimer»: «Runde geschafft · Mathe» / «Pause vorbei». Нажатие → `/lerntimer`. Без разрешения на уведомления — тихо ничего. Новый демо-APK.

## Анимации (пожелание владельца)
Игровые, как Karteikarten (правило «Playful»): кольцо плавно тает (каждую секунду, без рывков), цифры перелистываются; старт — кольцо «вдох» (пружина), пауза — кольцо «дышит»; конец раунда — пружинящая галочка, точка раунда «впрыгивает», шторка выезжает, лёгкий салют из точек цвета предмета; перерыв — кольцо перекрашивается в зелёный плавно. «Animationen: Weniger/Aus» и `prefers-reduced-motion` — всё спокойно.

## Datenschutz
Новый раздел «Lerntimer»: время учёбы по предметам только на устройстве и в Sync (зашифровано); в Android — будильник на конец раунда на телефоне.

## Бэкенд
Не нужен.

## Чего здесь НЕТ
- Учитель не видит время учеников; нет рейтингов.
- Нет фоновой музыки/белого шума.
- Идущий таймер не переезжает на другое устройство.
- Сессию нельзя исправить/удалить вручную.

## Отличия от дизайна
- ПК-макет: в боковом меню подсвечено «Tests» — в коде активен «Lerntimer» (или «Mehr»).
- Statistik: «Lernzeit» сверху, переключатель Woche/Monat (на ПК и Halbjahr) действует и на неё.
- Под кольцом в перерыве — «fertig um …», а не «aufstehen, trinken» (правило владельца 14.11: без подсказок-пояснений).
- Поле предмета — общий ListPicker (19c): без строки «Mü · Kurs 204».
- Шторка «Runde geschafft!»: заголовок сверху, как у всех шторок; галочка с салютом под ним.
- Будильник Android после перезагрузки телефона пропадает (сайт поставит новый при следующем открытии).

## Слова
- **Pomodoro** — учёба кусками: 25 минут фокус, 5 минут пауза, после 4 раундов длинная пауза.
- **Runde** — один кусок фокуса.
- **Sync-блок** — зашифрованный пакет на сервере, который сервер не может прочитать.

## Открытые вопросы
нет
