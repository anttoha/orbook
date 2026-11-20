package net.orbitium.orbook.notify

import android.content.Context
import org.json.JSONObject
import java.time.LocalTime

/**
 * Часть 31e. Настройки уведомлений самого приложения (экран «Mitteilungen» на сайте пишет их через мост).
 * Поля — как в src/shared/utils/appNotify.js. По умолчанию выключено; «Vor der Stunde» — тоже выключено.
 */
data class NotifySettings(
    val on: Boolean = false,
    val planTomorrow: Boolean = true,
    val cancelledToday: Boolean = true,
    val reminder: Boolean = true,
    val newExam: Boolean = false,
    val newGrade: Boolean = false, // часть 36c: «Neue Note» из InfoPoint, по умолчанию выключено
    val quietOn: Boolean = true,
    val quietStart: LocalTime = LocalTime.of(21, 0),
    val quietEnd: LocalTime = LocalTime.of(6, 30),
    val beforeOn: Boolean = false,
    val beforeMinutes: Int = 10,
    val reminderTime: LocalTime = LocalTime.of(18, 0),
) {
    fun toJson(): JSONObject = JSONObject()
        .put("on", on)
        .put("prefs", JSONObject().put("planTomorrow", planTomorrow).put("cancelledToday", cancelledToday).put("reminder", reminder).put("newExam", newExam).put("newGrade", newGrade))
        .put("quiet", JSONObject().put("on", quietOn).put("start", hhmm(quietStart)).put("end", hhmm(quietEnd)))
        .put("before", JSONObject().put("on", beforeOn).put("minutes", beforeMinutes))
        .put("reminderTime", hhmm(reminderTime))

    /** Ruhezeit: сейчас тихо? Интервал может переходить через полночь (21:00–06:30). */
    fun quiet(at: LocalTime): Boolean {
        if (!quietOn || quietStart == quietEnd) return false
        return if (quietStart < quietEnd) at >= quietStart && at < quietEnd else at >= quietStart || at < quietEnd
    }

    companion object {
        private fun hhmm(t: LocalTime) = "%02d:%02d".format(t.hour, t.minute)
        private fun time(value: String?, default: LocalTime) =
            value?.let { runCatching { LocalTime.parse(it) }.getOrNull() } ?: default

        fun from(json: JSONObject?): NotifySettings {
            val d = NotifySettings()
            if (json == null) return d
            val prefs = json.optJSONObject("prefs")
            val quiet = json.optJSONObject("quiet")
            val before = json.optJSONObject("before")
            fun bool(o: JSONObject?, key: String, default: Boolean) = if (o?.opt(key) is Boolean) o.getBoolean(key) else default
            return NotifySettings(
                on = bool(json, "on", d.on),
                planTomorrow = bool(prefs, "planTomorrow", d.planTomorrow),
                cancelledToday = bool(prefs, "cancelledToday", d.cancelledToday),
                reminder = bool(prefs, "reminder", d.reminder),
                newExam = bool(prefs, "newExam", d.newExam),
                newGrade = bool(prefs, "newGrade", d.newGrade),
                quietOn = bool(quiet, "on", d.quietOn),
                quietStart = time(quiet?.optString("start"), d.quietStart),
                quietEnd = time(quiet?.optString("end"), d.quietEnd),
                beforeOn = bool(before, "on", d.beforeOn),
                beforeMinutes = before?.optInt("minutes", d.beforeMinutes)?.takeIf { it in setOf(5, 10, 15) } ?: d.beforeMinutes,
                reminderTime = time(json.optString("reminderTime"), d.reminderTime),
            )
        }

        private fun prefs(context: Context) = context.getSharedPreferences("orbook-notify", Context.MODE_PRIVATE)

        fun load(context: Context): NotifySettings =
            from(runCatching { JSONObject(prefs(context).getString("settings", null) ?: "{}") }.getOrNull())

        fun save(context: Context, settings: NotifySettings) = prefs(context).edit().putString("settings", settings.toJson().toString()).apply()

        /** Спрашивали ли уже разрешение Android (тогда «нет» значит «запрещено», а не «ещё не спрашивали»). */
        fun asked(context: Context) = prefs(context).getBoolean("asked", false)
        fun markAsked(context: Context) = prefs(context).edit().putBoolean("asked", true).apply()
    }
}
