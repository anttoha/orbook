package net.orbitium.orbook.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Настройка одного виджета («Widget einstellen»). Поля и значения — как в src/shared/utils/widgetConfig.js.
 * «app» — «Wie App»: виджет повторяет «Darstellung» и «Stundenplan» приложения (они приходят в снимке).
 */
data class WidgetConfig(
    val kind: String = "jetzt",
    val classId: Int? = null,
    val mine: Boolean = true,
    val look: String = "app", // app | hell | dunkel
    val design: String = "app", // app | soft | glas | klar
    val accent: String = "app", // app | violett | blau | gruen | orange | pink | grafit
    val font: String = "m", // s | m | l
    val alpha: Int = 100, // фон карточки, %: 0 — только текст
    val onlyChanges: Boolean = false,
    val evening: Boolean = true, // «Abends schon morgen»
    val subject: String = "app", // app | kuerzel | name
    val place: String = "app", // app | raum | beides
    val cancelled: String = "app", // app | ausblenden
    val next: Boolean = true, // Jetzt: «Danach zeigen»
    val progress: Boolean = true, // Jetzt: полоска
    val weekend: String = "next", // Woche: next | leer
    val cell: String = "kuerzel", // Woche: kuerzel | raum | lehrkraft
    val testsDays: Int = 14, // 7 | 14 | 0 (все)
    val showDone: Boolean = false,
    val sort: String = "faellig", // faellig | fach
    val changes: String = "morgen", // heute | morgen | woche
    val termineDays: Int = 90, // 30 | 90 | 0 (все)
    val count: String = "schultage", // schultage | tage
    val refresh: Int = 30, // минут: 15 | 30 | 60
    val open: String = "auto", // auto | tag | woche | tests | start
) {
    fun toJson(): JSONObject = JSONObject()
        .put("kind", kind).put("classId", classId ?: JSONObject.NULL).put("mine", mine)
        .put("look", look).put("design", design).put("accent", accent).put("font", font).put("alpha", alpha)
        .put("onlyChanges", onlyChanges).put("evening", evening).put("subject", subject).put("place", place).put("cancelled", cancelled)
        .put("next", next).put("progress", progress).put("weekend", weekend).put("cell", cell).put("testsDays", testsDays)
        .put("showDone", showDone).put("sort", sort).put("changes", changes).put("termineDays", termineDays).put("count", count)
        .put("refresh", refresh).put("open", open)

    companion object {
        val KINDS = listOf("jetzt", "heute", "woche", "tests", "aufgaben", "aenderungen", "termine", "notizen", "countdown")
        private val ACCENTS = listOf("app", "violett", "blau", "gruen", "orange", "pink", "grafit")

        fun from(json: JSONObject?): WidgetConfig {
            if (json == null) return WidgetConfig()
            val d = WidgetConfig()
            fun pick(key: String, allowed: Collection<String>, default: String) = json.optString(key).takeIf { it in allowed } ?: default
            fun pickInt(key: String, allowed: Collection<Int>, default: Int) = if (json.has(key)) json.optInt(key, default).takeIf { it in allowed } ?: default else default
            fun bool(key: String, default: Boolean) = if (json.opt(key) is Boolean) json.getBoolean(key) else default
            // настройка из 31b: «Hintergrund Halb» = 70 %
            val alpha = if (json.has("alpha")) json.optInt("alpha", 100).coerceIn(0, 100) else if (json.optString("background") == "halb") 70 else 100
            return WidgetConfig(
                kind = pick("kind", KINDS, d.kind),
                classId = if (json.isNull("classId") || !json.has("classId")) null else json.optInt("classId"),
                mine = bool("mine", d.mine),
                look = pick("look", setOf("app", "hell", "dunkel"), d.look),
                design = pick("design", setOf("app", "soft", "glas", "klar"), d.design),
                accent = pick("accent", ACCENTS, d.accent),
                font = pick("font", setOf("s", "m", "l"), d.font),
                alpha = alpha,
                onlyChanges = bool("onlyChanges", d.onlyChanges),
                evening = bool("evening", d.evening),
                subject = pick("subject", setOf("app", "kuerzel", "name"), d.subject),
                place = pick("place", setOf("app", "raum", "beides"), d.place),
                cancelled = pick("cancelled", setOf("app", "ausblenden"), d.cancelled),
                next = bool("next", d.next),
                progress = bool("progress", d.progress),
                weekend = pick("weekend", setOf("next", "leer"), d.weekend),
                cell = pick("cell", setOf("kuerzel", "raum", "lehrkraft"), d.cell),
                testsDays = pickInt("testsDays", setOf(7, 14, 0), d.testsDays),
                showDone = bool("showDone", d.showDone),
                sort = pick("sort", setOf("faellig", "fach"), d.sort),
                changes = pick("changes", setOf("heute", "morgen", "woche"), d.changes),
                termineDays = pickInt("termineDays", setOf(30, 90, 0), d.termineDays),
                count = pick("count", setOf("schultage", "tage"), d.count),
                refresh = pickInt("refresh", setOf(15, 30, 60), d.refresh),
                open = pick("open", setOf("auto", "tag", "woche", "tests", "start"), d.open),
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
    val design: String = "soft", // часть 31d: оформление приложения — «Wie App» у виджета
    val accent: String = "violett",
    val plan: PlanView = PlanView(),
    val activeId: Int? = null, // часть 31e: открытый класс — о его уроках напоминает «Vor der Stunde»
)

/** «Stundenplan» приложения (src/shared/utils/planView.js) — то, что нужно виджету. */
data class PlanView(
    val lessonLabel: String = "kuerzel", // kuerzel | name — подпись в клетке недели
    val showRoom: Boolean = true,
    val showTeacher: Boolean = false,
    val hideCancelled: Boolean = false, // «Ausfall · Ausblenden»
)

/**
 * Всё, что виджет хранит на телефоне (SharedPreferences, только в приложении):
 * снимок сайта, настройки виджетов и последний ответ /api/widget по каждому классу.
 */
class WidgetStore(context: Context) {
    private val prefs = context.getSharedPreferences("orbook-widget", Context.MODE_PRIVATE)

    /** Часть 31e: какой ответ сервера уже «показан» уведомлениями — с ним сравнивается новый. */
    fun seen(key: String): String? = prefs.getString("seen-$key", null)
    fun saveSeen(key: String, json: String) = prefs.edit().putString("seen-$key", json).apply()

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
        val look = o.optJSONObject("look")
        val plan = o.optJSONObject("plan")
        return Snapshot(
            classes = classes,
            done = o.optJSONArray("done").strings().mapNotNull(String::toIntOrNull).toSet(),
            palette = o.optJSONObject("palette").toMap(),
            theme = o.optString("theme").takeIf { it == "light" || it == "dark" },
            texts = Texts(texts.toMap(), o.optString("lang", "de")),
            design = look?.optString("design")?.takeIf { it in setOf("soft", "glas", "klar") } ?: "soft",
            accent = look?.optString("accent")?.ifEmpty { null } ?: "violett",
            activeId = if (o.isNull("activeId") || !o.has("activeId")) null else o.optInt("activeId"),
            plan = PlanView(
                lessonLabel = if (plan?.optString("lessonLabel") == "name") "name" else "kuerzel",
                showRoom = plan?.optBoolean("showRoom", true) ?: true,
                showTeacher = plan?.optBoolean("showTeacher", false) ?: false,
                hideCancelled = plan?.optString("cancelled") == "ausblenden",
            ),
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
