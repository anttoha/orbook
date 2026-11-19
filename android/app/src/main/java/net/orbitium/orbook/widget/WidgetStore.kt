package net.orbitium.orbook.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** Настройка одного виджета («Widget einstellen»). */
data class WidgetConfig(
    val kind: String = "jetzt",
    val classId: Int? = null,
    val mine: Boolean = true,
    val look: String = "app", // app | hell | dunkel
    val background: String = "voll", // voll | halb
) {
    fun toJson(): JSONObject = JSONObject()
        .put("kind", kind).put("classId", classId ?: JSONObject.NULL).put("mine", mine)
        .put("look", look).put("background", background)

    companion object {
        val KINDS = listOf("jetzt", "heute", "woche", "tests", "aufgaben", "aenderungen", "termine", "notizen", "countdown")

        fun from(json: JSONObject?): WidgetConfig {
            if (json == null) return WidgetConfig()
            return WidgetConfig(
                kind = json.optString("kind").takeIf { it in KINDS } ?: "jetzt",
                classId = if (json.isNull("classId") || !json.has("classId")) null else json.optInt("classId"),
                mine = json.optBoolean("mine", true),
                look = json.optString("look").takeIf { it in setOf("app", "hell", "dunkel") } ?: "app",
                background = json.optString("background").takeIf { it in setOf("voll", "halb") } ?: "voll",
            )
        }
    }
}

/** Класс из снимка сайта: имя и «Meine Kurse» — как параметры courses/hidden у /api/widget. */
data class SnapshotClass(val id: Int, val name: String, val courses: List<String>, val hidden: List<String>, val notes: List<String>)

/**
 * Снимок, который кладёт сайт (ORBookAndroid.saveSnapshot): то, чего нет на сервере —
 * классы устройства, «Meine Kurse», заметки, галочки домашек, свои цвета предметов, тема и тексты.
 */
data class Snapshot(
    val classes: List<SnapshotClass>,
    val done: Set<Int>,
    val palette: Map<String, String>,
    val theme: String?, // light | dark | null (как телефон)
    val texts: Texts,
)

/**
 * Всё, что виджет хранит на телефоне (SharedPreferences, только в приложении):
 * снимок сайта, настройки виджетов и последний ответ /api/widget по каждому классу.
 */
class WidgetStore(context: Context) {
    private val prefs = context.getSharedPreferences("orbook-widget", Context.MODE_PRIVATE)

    fun saveSnapshot(json: String) = prefs.edit().putString("snapshot", json).apply()

    fun snapshot(): Snapshot {
        val o = runCatching { JSONObject(prefs.getString("snapshot", null) ?: "{}") }.getOrDefault(JSONObject())
        val classes = o.optJSONArray("classes").objects().map { c ->
            SnapshotClass(
                id = c.optInt("id"),
                name = c.optString("name"),
                courses = c.optJSONArray("courses").strings(),
                hidden = c.optJSONArray("hidden").strings(),
                notes = c.optJSONArray("notes").strings(),
            )
        }
        val texts = o.optJSONObject("texts")
        return Snapshot(
            classes = classes,
            done = o.optJSONArray("done").strings().mapNotNull(String::toIntOrNull).toSet(),
            palette = o.optJSONObject("palette").toMap(),
            theme = o.optString("theme").takeIf { it == "light" || it == "dark" },
            texts = Texts(texts.toMap(), o.optString("lang", "de")),
        )
    }

    fun config(id: Int): WidgetConfig? = prefs.getString("config-$id", null)?.let { WidgetConfig.from(JSONObject(it)) }

    fun saveConfig(id: Int, config: WidgetConfig) = prefs.edit().putString("config-$id", config.toJson().toString()).apply()

    fun removeConfig(id: Int) = prefs.edit().remove("config-$id").apply()

    // ── ответы сервера: ключ — класс и «Nur meine Kurse» ──

    fun data(key: String): String? = prefs.getString("data-$key", null)
    fun etag(key: String): String? = prefs.getString("etag-$key", null)
    fun fetchedAt(key: String): Long = prefs.getLong("fetched-$key", 0)
    fun state(key: String): String = prefs.getString("state-$key", "ok") ?: "ok"

    fun saveData(key: String, json: String, etag: String?, now: Long) = prefs.edit()
        .putString("data-$key", json).putString("etag-$key", etag).putLong("fetched-$key", now).putString("state-$key", "ok").apply()

    fun touch(key: String, now: Long) = prefs.edit().putLong("fetched-$key", now).putString("state-$key", "ok").apply()

    /** auth — «Nicht angemeldet», ended — «Zugang beendet». */
    fun saveState(key: String, state: String) = prefs.edit().putString("state-$key", state).apply()

    companion object {
        fun key(classId: Int?, mine: Boolean) = "${classId ?: 0}-${if (mine) "mine" else "all"}"
    }
}

private fun JSONArray?.objects(): List<JSONObject> = if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }
private fun JSONArray?.strings(): List<String> = if (this == null) emptyList() else (0 until length()).map { optString(it) }
private fun JSONObject?.toMap(): Map<String, String> = if (this == null) emptyMap() else keys().asSequence().associateWith { optString(it) }
