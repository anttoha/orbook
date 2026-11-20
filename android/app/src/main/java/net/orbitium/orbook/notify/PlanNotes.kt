package net.orbitium.orbook.notify

import net.orbitium.orbook.widget.Day
import net.orbitium.orbook.widget.Lesson
import net.orbitium.orbook.widget.Texts
import net.orbitium.orbook.widget.WidgetData
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * Часть 31e. Что сказать в уведомлении — чистые функции без Android (их проверяет PlanNotesTest):
 *   • planChanges — сравнить прошлый ответ сервера с новым: отмены сегодня, изменения на завтра, новые тесты;
 *   • eveningNote — вечером: тесты и домашки на следующий учебный день;
 *   • nextLesson — ближайший урок для «Vor der Stunde».
 * Время — «школьное» (data.now): у демо свой «сегодня», телефон его не знает.
 */
data class Note(val id: String, val text: String, val path: String)

private fun Lesson.sign() = listOf(status, subject, teacher, room).joinToString("|")
private fun Lesson.label(t: Texts) = "${t.t("{n}. Std", period)} ${title}"

/** «fällt aus», «Vertretung · Raum 204», «Raum 014» */
private fun Lesson.what(t: Texts): String = when {
    cancelled -> t.t("fällt aus")
    status == "room_change" -> "· " + t.t("Raum {n}", room ?: "")
    else -> "· " + listOfNotNull(t.t("Vertretung"), room?.let { t.t("Raum {n}", it) }).joinToString(" · ")
}

/** Следующий учебный день после date (с уроками). */
fun nextSchoolDay(days: List<Day>, date: LocalDate): Day? = days.firstOrNull { it.date > date && it.hasLessons }

fun planChanges(old: WidgetData, new: WidgetData, at: LocalDateTime, s: NotifySettings, t: Texts): List<Note> {
    val today = at.toLocalDate()
    val before = old.days.flatMap { d -> d.lessons.map { (d.date to it.period) to it } }.groupBy({ it.first }, { it.second.sign() })
    val next = nextSchoolDay(new.days, today)
    val notes = mutableListOf<Note>()
    val tomorrow = mutableListOf<Lesson>()
    for (day in new.days) {
        if (day.status != "ok" || (day.date != today && day.date != next?.date)) continue
        for (lesson in day.lessons) {
            if (!lesson.cancelled && !lesson.changed) continue
            if (before[day.date to lesson.period]?.contains(lesson.sign()) == true) continue // это уже было
            if (day.date == today) {
                val ended = lesson.end != null && lesson.end <= at.toLocalTime()
                if (s.cancelledToday && lesson.cancelled && !ended) {
                    notes += Note("heute-${day.date}-${lesson.period}", "${t.t("Heute")}: ${lesson.label(t)} ${lesson.what(t)}", "/heute")
                }
            } else if (s.planTomorrow) {
                tomorrow += lesson
            }
        }
    }
    // на завтра много изменений — одно уведомление, а не пять
    if (tomorrow.size > 2) notes += Note("morgen-${next?.date}", "${t.t("Morgen")}: ${t.t("{n} Änderungen im Plan", tomorrow.size)}", "/heute")
    else tomorrow.forEach { notes += Note("morgen-${next?.date}-${it.period}", "${t.t("Morgen")}: ${it.label(t)} ${it.what(t)}", "/heute") }
    if (s.newExam) {
        val known = old.exams.map { it.id }.toSet()
        new.exams.filter { it.id !in known && !it.date.isBefore(today) }.forEach {
            notes += Note("test-${it.id}", "${t.t("Neuer Test")}: ${it.title} · ${it.date.dayOfMonth}.${it.date.monthValue}.", "/testen")
        }
    }
    return notes
}

/** Вечернее «Morgen»: тесты и невыполненные домашки на следующий учебный день; ничего нет — null. */
fun eveningNote(data: WidgetData, at: LocalDateTime, done: Set<Int>, t: Texts): Note? {
    val day = nextSchoolDay(data.days, at.toLocalDate()) ?: return null
    val lines = data.exams.filter { it.date == day.date }.map { "${t.t("Test")} ${it.title}" } +
        data.homework.filter { it.date == day.date && it.id !in done }.map { "${t.t("Hausaufgabe")} ${it.title}: ${it.text.lineSequence().first()}" }
    if (lines.isEmpty()) return null
    return Note("abend-${day.date}", "${t.t("Morgen")}: ${lines.joinToString("\n")}", "/testen")
}

/** Ближайший урок, о котором ещё не поздно напомнить (начало − minutes > сейчас); отменённые пропускаем. */
fun nextLesson(data: WidgetData, at: LocalDateTime, minutes: Int): Pair<LocalDateTime, Lesson>? =
    data.days.asSequence()
        .filter { it.date >= at.toLocalDate() }
        .flatMap { d -> d.lessons.asSequence().filter { !it.cancelled && it.start != null }.map { d.date.atTime(it.start) to it } }
        .filter { (start, _) -> start.minusMinutes(minutes.toLong()) > at }
        .minByOrNull { it.first }

/** «In 10 min: 3. Std Physik · Raum 301» */
fun beforeText(lesson: Lesson, minutes: Int, t: Texts): String =
    "${t.t("In {n} min", minutes)}: ${lesson.label(t)}" +
        (if (lesson.changed && lesson.status != "room_change") " · ${t.t("Vertretung")}" else "") +
        (lesson.room?.let { " · ${t.t("Raum {n}", it)}" } ?: "")
