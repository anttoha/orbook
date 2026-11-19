#!/usr/bin/env bash
# Часть 31a: собрать и подписать APK и отдать его бэкенду (GET /api/public/android).
# Запуск от root на сервере:  scripts/android-build.sh --site orbook-demo   (прод: --site orbook — только с «на прод»)
set -euo pipefail

site=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --site) site="${2:-}"; shift 2 ;;
    *) echo "Unbekannte Option: $1" >&2; exit 2 ;;
  esac
done
case "$site" in
  orbook) flavor=prod ;;
  orbook-demo) flavor=demo ;;
  *) echo "Nutzung: $0 --site orbook|orbook-demo" >&2; exit 2 ;;
esac

repo="$(cd "$(dirname "$0")/.." && pwd)"
keys=/root/.orbook-android
out="/var/lib/$site/android"
export ANDROID_HOME=/opt/android-sdk
export ORBOOK_KEYSTORE_PROPS="$keys/keystore.properties"

if [[ ! -f "$keys/release.jks" || ! -f "$ORBOOK_KEYSTORE_PROPS" ]]; then
  echo "Kein Signaturschlüssel in $keys – siehe android/README.md" >&2
  exit 1
fi

# versionName = последняя версия из changelog; versionCode растёт с каждой сборкой (общий счётчик)
version_name="$(node "$repo/scripts/android-notes.mjs" version)"
code_file="$keys/version-code"
version_code=$(( $(cat "$code_file" 2>/dev/null || echo 0) + 1 ))
export ORBOOK_VERSION_NAME="$version_name" ORBOOK_VERSION_CODE="$version_code"

echo "== Baue $flavor $version_name ($version_code)"
(cd "$repo/android" && ./gradlew --no-daemon -q "assemble${flavor^}Release")
apk="$repo/android/app/build/outputs/apk/$flavor/release/app-$flavor-release.apk"
"$ANDROID_HOME/build-tools/35.0.0/apksigner" verify "$apk"
echo "$version_code" > "$code_file"

# Сначала новые файлы рядом, потом подмена — сервер не увидит половину APK
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$apk" "$tmp/app.apk"
size=$(stat -c %s "$tmp/app.apk")
sha=$(sha256sum "$tmp/app.apk" | cut -d' ' -f1)
node "$repo/scripts/android-notes.mjs" json "$version_name" "$version_code" "$size" "$sha" > "$tmp/android.json"

install -d -o root -g orbook -m 750 "$out"
install -o root -g orbook -m 640 "$tmp/app.apk" "$out/app.apk.new"
install -o root -g orbook -m 640 "$tmp/android.json" "$out/android.json.new"
mv "$out/app.apk.new" "$out/app.apk"
mv "$out/android.json.new" "$out/android.json"
echo "== Fertig: $out ($((size / 1024)) KB)"

# Только для прода: тот же подписанный APK — в GitHub Release (вкладка «Assets»). Токен — /root/.orbook-android/gh-token.
# Нет токена, тега или Release — только предупреждение: сайт уже обновлён, сборка не падает.
if [[ "$flavor" == prod ]]; then
  token_file="$keys/gh-token"
  tag="v$version_name"
  asset="$tmp/orbook-$version_name.apk"
  cp "$tmp/app.apk" "$asset"
  if [[ ! -s "$token_file" ]]; then
    echo "== Release: kein Token ($token_file) – APK nicht hochgeladen"
  elif GH_TOKEN="$(cat "$token_file")" gh release upload "$tag" "$asset" --clobber --repo anttoha/orbook; then
    echo "== Release $tag: orbook-$version_name.apk hochgeladen"
  else
    echo "== Release $tag: Upload fehlgeschlagen (Release schon da? Token abgelaufen?)" >&2
  fi
fi
