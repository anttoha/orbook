// Часть 31a: версия и «что нового» для APK — из src/shared/changelog.js (как «Was ist neu»).
//   node scripts/android-notes.mjs version                      → 0.17.1
//   node scripts/android-notes.mjs json NAME CODE SIZE SHA256   → android.json для бэкенда
import { changelog } from "../src/shared/changelog.js";

const [command, ...args] = process.argv.slice(2);

if (command === "version") {
  console.log(changelog[0].version);
} else if (command === "json") {
  const [versionName, code, size, sha256] = args;
  const entry = changelog.find((item) => item.version === versionName) ?? {};
  const notes = { neu: entry.neu ?? [], behoben: entry.behoben ?? [], entfernt: entry.entfernt ?? [] };
  const release = { versionName, versionCode: Number(code), size: Number(size), sha256, notes };
  console.log(JSON.stringify(release, null, 2));
} else {
  console.error("Nutzung: android-notes.mjs version | json NAME CODE SIZE SHA256");
  process.exit(2);
}
