# 31 · Android-App + Widget

**Статус:** дизайн ок 2026-11-19; код — под-частями 31a → 31b → 31c (каждая — отдельный чат, Opus · effort high)
**Источники:** `design/neu/31-android-widget/` (`gen.py`, `build.py`, `index.html`), артефакт https://claude.ai/artifact/RK6AsskFyQuMcpRoMyNzT4; ответы владельца 2026-11-19 (строка 31 в `README.md`); блоки «Start» — `docs/specs/30-personalisierung/spec.md`.

## Зачем
На Android — настоящее приложение (APK с нашего сайта, без Google Play) и виджет на рабочий стол: следующий урок, день, тесты, домашки — без открытия приложения. iPhone, Windows, Linux остаются на PWA (решение владельца).

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Рабочий стол | `handy-01-startbildschirm`, `handy-02-startbildschirm-gross` | Виджеты = блоки Start (Jetzt, Heute, Woche, Tests, Aufgaben, Änderungen, Termine, Notizen, Countdown), любой размер; у широких — чип класса |
| Состояния виджета | `handy-03-zustaende` | Wochenende (первый урок следующего учебного дня), offline («Stand Mi 07:12», серым), «Nicht angemeldet» → Öffnen, «Zugang beendet» → Neuer Code, загрузка |
| Widget einstellen | `handy-04-widget-einstellen` | Vorschau, Klasse, Inhalt (один из 9), Nur meine Kurse, Aussehen (App/Hell/Dunkel), Hintergrund (Voll/Halb), «Fertig» |
| Android-App (сайт) | `handy-05-android-app`, `handy-09-fehler`, `pc-01-android-app` | APK herunterladen, 3 шага установки, как добавить виджет, «Lieber als Web-App»; ошибка загрузки — тост; ПК — QR |
| Mehr | `handy-06-mehr` | Карточка «ORBook für Android» (только на Android в браузере, закрывается ✕) и строка «Android-App» в «Seiten» |
| Update | `handy-07-update`, `handy-08-update-laedt` | Окно «Update ist da» (что нового, Später / Aktualisieren), загрузка с полосой |
| Android-App (в APK) | `handy-10-in-der-app` | «Installiert · 0.18.0 · aktuell», «Nach Update suchen», список виджетов на телефоне |

## Как устроено (технические решения)
- **Своя маленькая Android-обёртка, без Capacitor/TWA.** Папка `android/` в этом репозитории: Kotlin, одна `MainActivity` с WebView, которая открывает **сам сайт** (`https://orbook.orbitium.net`, у демо-сборки — `orbook-demo…`). Поэтому пути `/api/...` остаются относительными (правило CLAUDE.md), cookie `orbook_session` — обычная cookie сайта, а интерфейс обновляется вместе с сайтом без нового APK. Capacitor не берём: он рассчитан на файлы внутри APK (там `/api` пришлось бы писать с доменом) и тянет npm-пакеты; TWA не даёт виджету доступа к cookie.
- **Мост JS ↔ Android:** объект `window.ORBookAndroid` (`addJavascriptInterface`), только для своего домена: `version()`, `widgets()`, `saveSnapshot(json)`, `refreshWidgets()`, `installUpdate(url)`. Во фронте — `src/shared/api/android.js` (есть ли мост, обёртки) с тестом; без моста всё работает как сейчас.
- **Виджет** — Jetpack Glance (Kotlin), один `GlanceAppWidget` с настройкой `Inhalt`; размеры — `SizeMode.Responsive`. Данные:
  - план, тесты, домашки, Termine, Countdown — новый эндпоинт бэкенда `GET /api/widget?kind=…&mine=1` (класс — `X-ORBook-Class`, cookie сессии из `CookieManager` WebView); сервер сам фильтрует по курсам устройства → в Kotlin нет копии логики фронта;
  - Notizen и «erledigt» у Aufgaben живут только на устройстве → фронт кладёт их через `saveSnapshot` при изменении;
  - обновление: WorkManager раз в 30 минут, сразу после открытия приложения и по событию нового плана (`usePlanLive` → `refreshWidgets()`); «Jetzt» пересчитывается по времени локально (без сети).
  - нет сети → последние данные + «Stand …»; `401` → «Nicht angemeldet»; `403 access_ended` → «Zugang beendet».
- **«Widget einstellen»** — нативный экран-конфигуратор (Glance/Compose в стиле Soft: цвета и Nunito из `index.css`, переписаны в `android/…/Theme.kt`). Список классов — `GET /api/auth/me` → `classes[]`.
- **Сборка и подпись — на сервере**, не в GitHub Actions (у Actions нет доступа к ключу без ручной настройки секретов владельцем): `scripts/android-build.sh` (JDK 21 уже есть, Android SDK — в `/opt/android-sdk`), ключ подписи — `/root/.orbook-android/release.jks` (не в git; копия — в резерве сервера, см. `docs/BETRIEB.md` бэкенда). **Ключ терять нельзя:** без него обновление поверх установленного APK невозможно.
- **Раздача APK — бэкенд** (часть `/opt/orbook-be`, по его CLAUDE.md): `GET /api/public/android` → `{versionName, versionCode, size, sha256, url, notes}` или `null`; `GET /api/public/android/apk` — сам файл из `var/android/`. Без входа. Отдельно для прода и демо.
- **Обновление:** приложение раз в день сравнивает `versionCode` с `/api/public/android`; новое → фронт показывает окно «Update ist da» (тексты — из `notes`, они же «behoben/neu» из changelog), «Aktualisieren» → `installUpdate` (DownloadManager + системный установщик, право `REQUEST_INSTALL_PACKAGES`). Отказ установщика или сеть → тост «Download fehlgeschlagen – keine Verbindung».
- **Версии:** `versionName` = версия фронта (`package.json`/changelog), `versionCode` растёт с каждой сборкой.

## Под-части
| № | Что | Где |
|---|---|---|
| 31a | Android-обёртка (`android/`, WebView на сайт, мост `version()`), SDK и ключ на сервере, `scripts/android-build.sh`, бэкенд `/api/public/android` + файл, проверка обновлений и окно «Update ist da» (07, 08), экран «Android-App» в APK без списка виджетов | `android/`, фронт, бэкенд |
| 31b | Виджет: Glance, 9 видов, размеры, состояния (03), «Widget einstellen» (04), `GET /api/widget` (бэкенд), `saveSnapshot`/`refreshWidgets`, WorkManager; список виджетов в «Android-App» (10) | `android/`, бэкенд, фронт |
| 31c | Сайт: карточка в Mehr и строка «Android-App» (06), страница с APK, шагами и QR (05, 09, pc-01), Datenschutz (что хранит APK и виджет на телефоне), changelog, переводы EN/UK | фронт |

## Datenschutz (дописать в 31b/31c)
APK и виджет хранят на телефоне то же, что сайт, плюс копию данных виджета (план на несколько дней, тесты, домашки, заметки для виджета) — только на устройстве. Сервер отдаёт APK без входа и не узнаёт, установлено ли приложение. Проверка обновлений — анонимный запрос раз в день.

## Проверка
- Фронт: `npm run lint`, `npm test`, `npm run build`; тест `android.js` (без моста — `null`, с мостом — вызовы).
- Android: `./gradlew assembleRelease lint` на сервере; эмулятора на сервере нет — установку проверяет владелец на своём телефоне (ссылка с демо).
- Бэкенд: `make lint test`, `docs/API.md`, `docs/openapi.json`.

## Открытых вопросов к владельцу нет
Всё, что осталось, — технические решения (записаны выше).
