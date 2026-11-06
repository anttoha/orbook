# 11 · Notizen + Sync

**Статус:** готово
**Источники:** дизайн «20 Notiz schreiben (Blatt)», «21 Notizen synchronisieren» (телефон), «21 Notiz schreiben (Fenster)», «27 Einstellungen · Notizen-Sync» (ПК), «27 Datenschutz» (телефон); `/opt/orbook-be/docs/frontend/06-notizen.md`, `07-einstellungen.md`; `docs/API.md` → «Notizen-Sync»; эталон `docs/examples/sync-crypto.mjs` (2026-11-06).

## Зачем
Заметки к дню и к уроку («Sportsachen mitnehmen») живут на телефоне. С Sync-Code те же заметки появляются на втором устройстве. Аккаунт для этого не нужен, а сервер не может прочитать заметки.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Notiz | 20 (телефон, шторка), 21 (ПК, окно) | поле «Notiz», чипы «Zu Fach · optional», дата + «Ändern», подпись про хранение, «Löschen» / «Speichern» |
| Synchronisieren | 21 (телефон), 27 (ПК) | текст, карточка «Dein Sync-Code» + копировать, «Zuletzt synchronisiert …», предупреждение, «Anderes Gerät verbinden», «Neuen Code erzeugen» |
| Datenschutz | 27 (телефон) | внизу кнопка «Meine Sync-Notizen löschen» |

## Что куда нажимать
- «+ Notiz» в «Meine Notizen» (день) или «Notiz zur Stunde» в окне урока → шторка Notiz. Нажать на заметку — та же шторка с её текстом.
- Чип предмета — выбрать или снять (можно без предмета). «Ändern» — выбрать другую дату (у заметки к уроку даты нет: она привязана к уроку).
- «Speichern» — сохранить на устройстве, через 5 с синхронизировать. «Löschen» — без вопроса, в тосте «Rückgängig».
- Mehr → «Notizen synchronisieren · K7QM-…» → экран Synchronisieren.
  - Синхронизация выключена: текст и кнопка «Code erzeugen», после этого код показывается.
  - Копировать — значок рядом с кодом, тост «Code kopiert».
  - «Verbinden»: код с другого устройства → «Wird verbunden …». Если на сервере пусто, окно «Zu diesem Code gibt es noch keine Notizen. Trotzdem verwenden?».
  - «Neuen Code erzeugen» — с подтверждением: старый код на других устройствах перестанет работать.
- Datenschutz → «Meine Sync-Notizen löschen» → подтверждение → `DELETE /api/sync`, код с устройства удаляется, заметки на устройстве остаются.

## Данные
| На экране | Откуда | Пусто? |
|---|---|---|
| Заметка | `userStore.notes[]`: `{id, text, date, subject, period, updatedAt (ISO), deleted?}` | `subject`, `period` бывают `null` |
| Чипы предметов | предметы уроков этого дня (`day.lessons[].subject`, без повторов, без `null`) + предмет заметки | день без уроков → чипов нет, подпись тоже скрыта |
| Подпись под заметкой | «Sport · 6. Std · nur für dich» / «Mathe · nur für dich» / «nur für dich» | предмет `null` → без него |
| «Dein Sync-Code» | `syncStore.code` (`orbook.sync`) | нет → состояние «Sync aus» |
| «Zuletzt synchronisiert heute 07:40 · 6 Notizen» | `syncStore.lastSyncAt`, `visibleNotes(notes).length` | ещё не было → «Noch nicht synchronisiert» |

Запросы: `GET/PUT/DELETE /api/sync`, `syncId` идёт **только** в заголовке `X-Sync-Id`. Ключи считаются на устройстве (`syncCrypto.js` — копия эталона, не переписывается).

## Когда синхронизируем
После входа (если есть код), при возвращении на вкладку и через 5 с после изменения заметок. Одновременно идёт только одна синхронизация. `429` — подождать `retryAfter`.

## Состояния
- Идёт синхронизация: «Wird synchronisiert …» вместо «Zuletzt …».
- Офлайн или таймаут: «Nicht synchronisiert — keine Verbindung», повтор при возвращении на вкладку. Заметки работают.
- `wrong_code`: «Code passt nicht zu den Notizen», ничего не перезаписываем.
- `conflict` (5 раз подряд): «Notizen konnten nicht abgeglichen werden. Später erneut versuchen.»
- `too_big` / `503 sync_full`: «Zu viele Notizen zum Synchronisieren» / «Der Sync-Speicher ist voll.»
- `403 feature_disabled` или `me.features.notesSync === false`: строки в Mehr и кнопки в Datenschutz нет, подпись в Notiz «Bleibt auf diesem Gerät.», синхронизации нет.
- Пусто: «Noch keine Notizen für diesen Tag.» (уже есть).
- Ошибка записи в `localStorage`: тост «Notiz konnte nicht gespeichert werden».

## Технические решения
- Заметки остаются в `userStore` (ключ `orbook-user`), а не в `orbook.notes`, как в документации: перенос не нужен. Persist версии 3 в `migrate` переводит числовой `updatedAt` в ISO и добавляет `subject: null`.
- id заметки к уроку остаётся `дата#урок`: на двух устройствах это одна заметка, слияние берёт более новую.
- Удаление = «надгробие» (`deleted: true`, пустой текст), его видит только синхронизация. Экраны читают через `visibleNotes`. Надгробия старше 30 дней выбрасывает `mergeNotes`.
- Логика из `06-notizen.md` — `shared/utils/notes.js` (+ тест), шифрование — `shared/utils/syncCrypto.js` (копия эталона, тест на вектор), запросы — `shared/api/sync.js`, состояние — `shared/store/syncStore.js` (persist `orbook.sync`: только `code`, `version`, `lastSyncAt`), запуск — `shared/hooks/useNotesSync.js`.
- Ключи (PBKDF2 600 000) считаем один раз на код и держим в памяти.

## Бэкенд
Не нужно (`/api/sync` уже есть).

## Чего здесь НЕТ
- Раскладки ПК с левым меню «Einstellungen» (часть 12): на ПК страница одной колонкой, как остальные настройки. Кнопки «Jetzt synchronisieren» (ПК, часть 12).
- QR-кода для кода.

## Отличия от дизайна
- Код из 20 символов `XXXX-XXXX-XXXX-XXXX-XXXX` (решение от 10.10.2026 в документации), а не из 10, как в макете. Поэтому шрифт кода меньше и строка может переноситься.
- Состояния «Sync aus», «Wird verbunden …», ошибки и окна подтверждения в макете не нарисованы. Они собраны из элементов экрана 21 и диалога «Klasse verlassen» (28).
- У заметки к уроку вместо «Ändern» строка «Mittwoch, 17. September · 2. Std» без кнопки.

## Слова
- **Sync-Code** — случайный ключ из 20 знаков. Кто его знает, тот видит заметки. Придумать свой нельзя.
- **syncId** — номер «ящика» на сервере, вычисляется из кода. Сервер не знает ни кода, ни заметок.
- **Надгробие** — метка «эта заметка удалена». Нужна, чтобы удаление дошло до других устройств.
- **Слияние** — из двух списков заметок берём по каждой заметке самую новую версию.

## Открытые вопросы
нет
