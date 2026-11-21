package net.orbitium.orbook.widget

import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate

/*
 * Часть 39: что показывают виджеты «Noten», «Neue Noten», «Fehlzeiten» (макет design/neu/39-widget-noten).
 * Данные — последний ответ InfoPoint, который приложение уже хранит (NotenStore, часть 36c), сервер не участвует.
 * Расчёт — как на сайте (src/shared/utils/noten.js и notenWidget.js); проверяет NotenWidgetTest.
 * Чистые функции без Android.
 */

/** Предмет: средняя оценка полугодия (null — только «m.E.»), есть ли новая оценка. */
data class GradeSubject(val code: String, val name: String, val average: Double?, val fresh: Boolean)

/** Одна оценка: «3+», число для цвета, что это было («Klassenarbeit 1»), когда, новая ли. */
data class GradeEntry(val code: String, val subject: String, val grade: String, val value: Double?, val what: String?, val date: LocalDate?, val fresh: Boolean)

/** Пропуск: целый день или часы (hours null — текст InfoPoint в amount); excused null — не указано. */
data class Absence(val date: LocalDate?, val wholeDay: Boolean, val hours: Int?, val amount: String?, val excused: Boolean?)

data class AbsenceStats(val days: Int, val hours: Int, val unexcused: Int)

data class NotenView(
    val half: Int,
    val average: Double?,
    val subjects: List<GradeSubject>, // новые — первыми
    val latest: List<GradeEntry>, // новые сверху
    val stats: AbsenceStats,
    val absences: List<Absence>, // новые сверху
    val stand: LocalDate?, // «Stand 16.09.»
)

private fun JSONObject.text(key: String): String? = if (isNull(key)) null else optString(key).ifEmpty { null }
private fun JSONObject.number(key: String): Double? = if (isNull(key) || !has(key)) null else optDouble(key).takeIf { !it.isNaN() }
private fun JSONObject.day(key: String): LocalDate? = text(key)?.take(10)?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
private fun JSONArray?.objects(): List<JSONObject> = if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }

/** Как gradeKey на сайте: «код|дата|оценка|замечание», null → пусто. */
fun gradeKey(code: String, grade: JSONObject) = listOf(code, grade.text("date"), grade.text("grade"), grade.text("note")).joinToString("|") { it ?: "" }

/** «ma» → «Ma»: так InfoPoint-код становится похож на Kürzel плана (цвет предмета). */
fun notenBadge(code: String) = if (code.isEmpty()) "?" else code.take(3).replaceFirstChar { it.uppercase() }

/** Schnitt: Σ оценка×вес / Σ вес, только оценки с числом; незнакомый вес — ×1. */
private fun averageOf(grades: List<JSONObject>): Double? {
    val counted = grades.filter { it.number("value") != null }
    val weights = counted.sumOf { it.number("weight") ?: 1.0 }
    if (weights == 0.0) return null
    return counted.sumOf { it.number("value")!! * (it.number("weight") ?: 1.0) } / weights
}

fun notenView(json: String, fresh: Set<String>): NotenView {
    val o = JSONObject(json)
    val subjects = o.optJSONArray("subjects").objects()
    fun grades(s: JSONObject) = s.optJSONArray("grades").objects()
    // полугодие: есть оценки второго — второе
    val half = if (subjects.any { s -> grades(s).any { it.optInt("half") == 2 } }) 2 else 1
    fun inHalf(s: JSONObject) = grades(s).filter { it.optInt("half") == half }.sortedByDescending { it.text("date") ?: "" }

    val list = subjects.map { it to inHalf(it) }.filter { it.second.isNotEmpty() }.map { (s, g) ->
        val code = s.text("code") ?: ""
        GradeSubject(code, s.text("name") ?: code, averageOf(g), g.any { gradeKey(code, it) in fresh })
    }
    val averages = list.mapNotNull { it.average }
    val latest = subjects.flatMap { s ->
        val code = s.text("code") ?: ""
        inHalf(s).filter { it.text("grade") != null }.map {
            GradeEntry(code, s.text("name") ?: code, it.text("grade")!!, it.number("value"), it.text("note"), it.day("date"), gradeKey(code, it) in fresh)
        }
    }.sortedByDescending { it.date?.toString() ?: "" }

    val absences = o.optJSONObject("absences")
    val days = absences?.optJSONArray("days").objects().filter { it.optInt("half") == half }
    val hours = absences?.optJSONArray("hours").objects().filter { it.optInt("half") == half }
    fun excused(e: JSONObject): Boolean? = if (e.isNull("excused") || !e.has("excused")) null else e.optBoolean("excused")
    val entries = days.map { Absence(it.day("date"), true, null, null, excused(it)) } +
        hours.map { Absence(it.day("date"), false, it.number("hours")?.toInt(), it.text("amount"), excused(it)) }

    return NotenView(
        half = half,
        average = if (averages.isEmpty()) null else averages.average(),
        subjects = list.filter { it.fresh } + list.filterNot { it.fresh },
        latest = latest,
        stats = AbsenceStats(days.size, hours.sumOf { it.number("hours")?.toInt() ?: 0 }, (days + hours).count { excused(it) == false }),
        absences = entries.sortedByDescending { it.date?.toString() ?: "" },
        stand = o.day("updatedAt") ?: o.day("fetchedAt"),
    )
}

/** «2,1»; null — «–». */
fun noteNumber(value: Double?): String = if (value == null) "–" else String.format(java.util.Locale.ROOT, "%.1f", value).replace('.', ',')

/** Цвет оценки как на сайте (gradeTone): до 2,5 — хорошо, больше 3,5 — плохо, между — нейтрально. */
fun gradeTone(value: Double?): String = when {
    value == null -> "none"
    value <= 2.5 -> "good"
    value > 3.5 -> "bad"
    else -> "mid"
}

/**
 * Правило fit() в две колонки (широкий «Noten»): на строку приходится два пункта.
 * Не влезает и так — самые важные (prio меньше) в обычном порядке, остальное — «+ N weitere».
 */
fun <T> fitColumns(items: List<T>, availDp: Float, modes: List<Mode>, prio: (T) -> Int): Fit<T> {
    val pairs = items.chunked(2)
    val rows = fit(pairs, availDp, modes) { pair -> pair.minOf(prio) }
    if (rows.hidden == 0) return Fit(rows.density, rows.rowDp, items, 0)
    val count = rows.shown.size * 2
    val keep = items.withIndex().sortedBy { prio(it.value) }.take(count).sortedBy { it.index }.map { it.value }
    return Fit(rows.density, rows.rowDp, keep, items.size - keep.size)
}
