package net.orbitium.orbook.widget

import net.orbitium.orbook.notify.NotifySettings
import net.orbitium.orbook.notify.beforeText
import net.orbitium.orbook.notify.eveningNote
import net.orbitium.orbook.notify.nextLesson
import net.orbitium.orbook.notify.planChanges
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

class PlanNotesTest {
    private val t = Texts(emptyMap(), "de")
    private val mon = LocalDate.of(2026, 11, 23)
    private val tue = mon.plusDays(1)

    private fun lesson(period: Int, subject: String, status: String = "normal", room: String? = "101", h: Int = 7 + period) =
        Lesson(period, LocalTime.of(h, 0), LocalTime.of(h, 45), status, subject, subject, null, "Kle", room)

    private fun data(today: List<Lesson>, tomorrow: List<Lesson>, exams: List<Entry> = emptyList(), homework: List<Entry> = emptyList()) =
        WidgetData("9b", null, listOf(Day(mon, "ok", null, true, today), Day(tue, "ok", null, true, tomorrow)), exams, homework, emptyList(), null)

    private val base = data(listOf(lesson(1, "Mathe"), lesson(3, "Englisch")), listOf(lesson(4, "Geschichte")))
    private val morning = mon.atTime(8, 30)

    @Test
    fun cancelledToday_andChangedTomorrow() {
        val new = data(listOf(lesson(1, "Mathe"), lesson(3, "Englisch", "cancelled")), listOf(lesson(4, "Geschichte", "substitution", "B12")))
        val notes = planChanges(base, new, morning, NotifySettings(), t)
        assertEquals(listOf("Heute: 3. Std Englisch fällt aus", "Morgen: 4. Std Geschichte · Vertretung · Raum B12"), notes.map { it.text })
    }

    @Test
    fun nothingNew_noNotes_andPastLessonsAreQuiet() {
        val new = data(listOf(lesson(1, "Mathe", "cancelled"), lesson(3, "Englisch")), listOf(lesson(4, "Geschichte")))
        assertTrue(planChanges(new, new, morning, NotifySettings(), t).isEmpty())
        // 1. урок (08:00–08:45) уже прошёл к 09:00 — об отмене не сообщаем
        assertTrue(planChanges(base, new, mon.atTime(9, 0), NotifySettings(), t).isEmpty())
    }

    @Test
    fun switchesAreRespected_andManyChangesAreOneNote() {
        val new = data(listOf(lesson(1, "Mathe"), lesson(3, "Englisch", "cancelled")),
            listOf(lesson(4, "Geschichte", "cancelled"), lesson(5, "Kunst", "cancelled"), lesson(6, "Sport", "cancelled")))
        val off = NotifySettings(cancelledToday = false)
        assertEquals(listOf("Morgen: 3 Änderungen im Plan"), planChanges(base, new, morning, off, t).map { it.text })
    }

    @Test
    fun newExam_onlyWhenSwitchedOn() {
        val exam = Entry(7, tue.plusDays(3), "Ma", "Mathe", "")
        val new = data(listOf(lesson(1, "Mathe"), lesson(3, "Englisch")), listOf(lesson(4, "Geschichte")), exams = listOf(exam))
        assertTrue(planChanges(base, new, morning, NotifySettings(), t).isEmpty())
        assertEquals(listOf("Neuer Test: Mathe · 27.11."), planChanges(base, new, morning, NotifySettings(newExam = true), t).map { it.text })
    }

    @Test
    fun evening_testsAndOpenHomeworkForNextSchoolDay() {
        val d = data(emptyList(), listOf(lesson(2, "Mathe")), exams = listOf(Entry(1, tue, "Ma", "Mathe", "")),
            homework = listOf(Entry(2, tue, "En", "Englisch", "Workbook p. 23"), Entry(3, tue, "De", "Deutsch", "Gedicht")))
        val note = eveningNote(d, mon.atTime(18, 0), done = setOf(3), t)
        assertEquals("Morgen: Test Mathe\nHausaufgabe Englisch: Workbook p. 23", note?.text)
        assertNull(eveningNote(data(emptyList(), listOf(lesson(2, "Mathe"))), mon.atTime(18, 0), emptySet(), t))
    }

    @Test
    fun nextLesson_skipsCancelledAndTooLate() {
        val d = data(listOf(lesson(1, "Mathe"), lesson(2, "Physik", "cancelled"), lesson(3, "Englisch", room = "301")), emptyList())
        val (start, l) = nextLesson(d, mon.atTime(8, 30), 10)!!
        assertEquals(mon.atTime(10, 0), start)
        assertEquals("In 10 min: 3. Std Englisch · Raum 301", beforeText(l, 10, t))
        // 09:52: до 3-го урока меньше 10 минут — уже следующий день (там уроков нет) → null
        assertNull(nextLesson(d, mon.atTime(9, 52), 10))
    }

    @Test
    fun quietTime_overMidnight() {
        val s = NotifySettings()
        assertTrue(s.quiet(LocalTime.of(22, 0)))
        assertTrue(s.quiet(LocalTime.of(5, 0)))
        assertTrue(!s.quiet(LocalTime.of(12, 0)))
        assertTrue(!NotifySettings(quietOn = false).quiet(LocalTime.of(22, 0)))
    }
}
