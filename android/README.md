# ORBook für Android (часть 31)

Маленькое приложение-обёртка: одна `MainActivity` с WebView открывает **сам сайт** (прод — `orbook.orbitium.net`, демо-сборка — `orbook-demo…`). Интерфейс приходит с сайта, поэтому новый APK нужен только когда меняется код в этой папке.

| Файл | Зачем |
|---|---|
| `app/src/main/java/…/MainActivity.kt` | WebView, отступы от системных панелей, «Назад», чужие ссылки — наружу |
| `…/AndroidBridge.kt` | `window.ORBookAndroid` для сайта (`version()`, `installUpdate()`, `cancelUpdate()`); во фронте — `src/shared/api/android.js` |
| `…/UpdateInstaller.kt` | скачать APK с `/api/public/android/apk`, сверить sha256, открыть установщик |
| `app/build.gradle.kts` | варианты `prod` / `demo`, подпись ключом с сервера |

## Сборка (на сервере, от root)

```bash
scripts/android-build.sh --site orbook-demo   # демо: собрать, подписать, отдать в /api/public/android
scripts/android-build.sh --site orbook        # прод — только вместе с «на прод»
```

Нужны: JDK 21, Android SDK в `/opt/android-sdk` (`platforms;android-35`, `build-tools;35.0.0`) и ключ подписи в `/root/.orbook-android/`:

- `release.jks` — ключ (создаётся один раз `keytool -genkeypair … -validity 10000`);
- `keystore.properties` — `storeFile`, `storePassword`, `keyAlias`, `keyPassword` (права 600);
- `version-code` — счётчик сборок.

**Ключ не терять:** без него новое APK не встанет поверх старого. Копию папки держать у владельца (см. `docs/BETRIEB.md` бэкенда, «Android-App»).
