package net.orbitium.orbook.widget

import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.OffsetDateTime

/** Ответ GET /api/widget (docs/API.md бэкенда, «Android-Widget»). */
data class Lesson(
    val period: Int,
    val start: LocalTime?,
    val end: LocalTime?,
    val status: String,
    val subject: String?,
    val name: String?,
    val label: String?,
    val teacher: String?,
    val room: String?,
) {
    val cancelled get() = status == "cancelled"
    val changed get() = status in CHANGED

    /** «Mathe», у групп Sport — «Sport · Mädchen» (как lessonName во фронте). */
    val title: String get() = name ?: subject ?: "–"
    val code: String get() = label?.takeIf { it.startsWith("Sp") && it.length > 2 } ?: subject ?: "–"
    val place: String get() = listOfNotNull(teacher, room).joinToString(" · ")

    companion object {
        val CHANGED = setOf("substitution", "moved", "added", "room_change")
    }
}

data class Day(val date: LocalDate, val status: String, val freeReason: String?, val expected: Boolean, val lessons: List<Lesson>) {
    val hasLessons get() = lessons.any { !it.cancelled } || (status == "ok" && lessons.isNotEmpty())
}

data class Entry(val id: Int, val date: LocalDate, val subject: String, val name: String?, val text: String) {
    val title get() = name ?: subject
}

data class Termin(val kind: String, val title: String, val from: LocalDate, val to: LocalDate?, val time: String?)

data class Countdown(val title: String, val from: LocalDate, val running: Boolean, val days: Int?, val progress: Float?)

data class WidgetData(
    val className: String,
    val now: LocalDateTime?, // часы школы в момент ответа (у демо — свой «сегодня»)
    val days: List<Day>,
    val exams: List<Entry>,
    val homework: List<Entry>,
    val appointments: List<Termin>,
    val countdown: Countdown?,
    val weather: Weather? = null, // часть 50c: прогноз места школы (null — погоды нет)
)

private fun JSONObject.str(key: String): String? = if (isNull(key)) null else optString(key).ifEmpty { null }
private fun JSONObject.date(key: String): LocalDate? = str(key)?.let(LocalDate::parse)
private fun JSONObject.time(key: String): LocalTime? = str(key)?.let(LocalTime::parse)
private inline fun <T> JSONArray?.map(block: (JSONObject) -> T): List<T> =
    if (this == null) emptyList() else (0 until length()).map { block(getJSONObject(it)) }

fun parseWidgetData(json: String): WidgetData {
    val o = JSONObject(json)
    return WidgetData(
        className = o.str("className") ?: "",
        now = o.str("now")?.let { runCatching { OffsetDateTime.parse(it).toLocalDateTime() }.getOrNull() },
        days = o.optJSONArray("days").map { d ->
            Day(
                date = LocalDate.parse(d.getString("date")),
                status = d.str("status") ?: "not_published",
                freeReason = d.str("freeReason"),
                expected = d.optBoolean("expected"),
                lessons = d.optJSONArray("lessons").map { l ->
                    Lesson(
                        period = l.optInt("period"), start = l.time("start"), end = l.time("end"),
                        status = l.str("status") ?: "normal", subject = l.str("subject"), name = l.str("name"),
                        label = l.str("label"), teacher = l.str("teacher"), room = l.str("room"),
                    )
                },
            )
        },
        exams = o.optJSONArray("exams").map(::entry),
        homework = o.optJSONArray("homework").map(::entry),
        appointments = o.optJSONArray("appointments").map { a ->
            Termin(a.str("kind") ?: "other", a.str("title") ?: "", LocalDate.parse(a.getString("dateFrom")), a.date("dateTo"), a.str("timeFrom"))
        },
        weather = o.optJSONObject("weather")?.let(::parseWeather),
        countdown = o.optJSONObject("countdown")?.let { c ->
            Countdown(
                title = c.str("title") ?: "",
                from = LocalDate.parse(c.getString("dateFrom")),
                running = c.optBoolean("running"),
                days = if (c.isNull("days")) null else c.optInt("days"),
                progress = if (c.isNull("progress")) null else c.optDouble("progress").toFloat(),
            )
        },
    )
}

private fun entry(e: JSONObject) = Entry(e.optInt("id"), LocalDate.parse(e.getString("date")), e.str("subject") ?: "", e.str("name"), e.str("text") ?: "")

// ── Что показать сейчас: «Jetzt», «Heute», «Änderungen» считаются по часам телефона ──

/** Урок, который идёт, или следующий сегодня; null — на сегодня уроков больше нет. */
data class Now(val lesson: Lesson, val running: Boolean, val nextCancelled: Lesson?, val after: Lesson?)

private fun Day.active() = lessons.filter { !it.cancelled && it.start != null && it.end != null }.sortedBy { it.start }

fun nowOf(days: List<Day>, at: LocalDateTime): Now? {
    val today = days.firstOrNull { it.date == at.toLocalDate() } ?: return null
    val time = at.toLocalTime()
    val active = today.active()
    val index = active.indexOfFirst { time < it.end!! }
    if (index < 0) return null
    val lesson = active[index]
    val nextCancelled = today.lessons.filter { it.cancelled && it.start != null && it.start > time }.minByOrNull { it.start!! }
    return Now(lesson, running = time >= lesson.start!!, nextCancelled = nextCancelled, after = active.getOrNull(index + 1))
}

/**
 * День для «Heute»: сегодня, а после последнего урока («Abends schon morgen») и в выходные — следующий учебный день.
 * evening = false — сегодняшний день виден до полуночи.
 */
fun dayToShow(days: List<Day>, at: LocalDateTime, evening: Boolean = true): Day? {
    val date = at.toLocalDate()
    val today = days.firstOrNull { it.date == date }
    val lastEnd = today?.active()?.lastOrNull()?.end
    if (today != null && today.hasLessons && (!evening || (lastEnd != null && at.toLocalTime() < lastEnd))) return today
    return days.firstOrNull { it.date > date && it.hasLessons }
}

/**
 * «Änderungen»: отмены и замены. range: heute — только сегодня (ещё не закончившиеся),
 * morgen — сегодня и следующий учебный день, woche — до конца этой недели (в выходные — следующей).
 */
fun changesIn(days: List<Day>, at: LocalDateTime, range: String = "morgen"): List<Pair<Day, Lesson>> {
    val date = at.toLocalDate()
    val next = days.firstOrNull { it.date > date && it.hasLessons }
    val weekEnd = weekToShow(days, at).lastOrNull()?.date ?: date
    val inRange: (Day) -> Boolean = when (range) {
        "heute" -> { d -> d.date == date }
        "woche" -> { d -> d.date >= date && d.date <= weekEnd }
        else -> { d -> d.date == date || d.date == next?.date }
    }
    return days.filter { inRange(it) && it.status == "ok" }
        .flatMap { d -> d.lessons.filter { it.cancelled || it.changed }.map { d to it } }
        .filter { (d, l) -> d.date != date || l.end == null || l.end > at.toLocalTime() }
}

/** Неделя для «Woche»: эта, а в субботу и воскресенье — следующая (как monday_of на сервере). */
fun weekToShow(days: List<Day>, at: LocalDateTime): List<Day> {
    val date = at.toLocalDate()
    val shift = if (at.dayOfWeek.value >= 6) 8 - at.dayOfWeek.value else 1 - at.dayOfWeek.value
    val monday = date.plusDays(shift.toLong())
    return days.filter { it.date >= monday && it.date <= monday.plusDays(4) }.ifEmpty { days.take(5) }
}
