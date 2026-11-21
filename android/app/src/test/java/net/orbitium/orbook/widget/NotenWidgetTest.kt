package net.orbitium.orbook.widget

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

/** Те же случаи, что src/shared/utils/notenWidget.test.js — виджет считает так же, как сайт. */
class NotenWidgetTest {
    private val data = """
        {"updatedAt": "2026-09-16", "fetchedAt": "2026-09-17T05:41:00Z",
         "subjects": [
           {"code": "de", "name": "Deutsch", "grades": [{"date": "2026-09-12", "grade": "2", "value": 2.0, "note": "Aufsatz", "weight": 1, "half": 1}]},
           {"code": "ma", "name": "Mathematik", "grades": [
              {"date": "2026-09-16", "grade": "3+", "value": 2.7, "note": "Klassenarbeit 1", "weight": 2, "half": 1},
              {"date": "2026-09-10", "grade": "2", "value": 2.0, "note": null, "weight": null, "half": 1}]},
           {"code": "ku", "name": "Kunst", "grades": [{"date": "2026-09-08", "grade": "m.E.", "value": null, "note": null, "weight": 1, "half": 1}]}],
         "absences": {"days": [{"date": "2026-09-15", "reason": null, "excused": true, "half": 1}],
                      "hours": [{"date": "2026-09-02", "hours": 1, "amount": "1 Stunde", "excused": false, "half": 1}]}}
    """.trimIndent()
    private val fresh = setOf("ma|2026-09-16|3+|Klassenarbeit 1")

    @Test
    fun schnittUndFaecherNeueZuerst() {
        val v = notenView(data, fresh)
        assertEquals(1, v.half)
        assertEquals(listOf("ma" to true, "de" to false, "ku" to false), v.subjects.map { it.code to it.fresh })
        assertEquals((2.7 * 2 + 2) / 3, v.subjects[0].average!!, 1e-9)
        assertNull(v.subjects[2].average) // «m.E.» не считается
        assertEquals(((2.7 * 2 + 2) / 3 + 2) / 2, v.average!!, 1e-9)
        assertEquals("2,2", noteNumber(v.average))
    }

    @Test
    fun letzteNotenNeueOben() {
        val v = notenView(data, fresh)
        assertEquals(listOf("3+", "2", "2", "m.E."), v.latest.map { it.grade })
        assertEquals("Klassenarbeit 1", v.latest[0].what)
        assertTrue(v.latest[0].fresh)
        assertNull(v.latest[2].what)
    }

    @Test
    fun fehlzeitenDesHalbjahrs() {
        val v = notenView(data, emptySet())
        assertEquals(AbsenceStats(1, 1, 1), v.stats)
        assertEquals(listOf(true, false), v.absences.map { it.wholeDay })
        assertEquals(LocalDate.of(2026, 9, 16), v.stand)
    }

    @Test
    fun zweitesHalbjahrUndLeereFelder() {
        val two = """{"subjects": [{"code": "ma", "name": "Mathe", "grades": [
            {"date": "2026-09-10", "grade": "2", "value": 2, "half": 1}, {"date": "2027-02-10", "grade": "1", "value": 1, "half": 2}]}]}"""
        assertEquals(2, notenView(two, emptySet()).half)
        assertEquals(listOf("1"), notenView(two, emptySet()).latest.map { it.grade })
        val empty = notenView("""{"subjects": [{"code": "ma", "name": "Mathe", "grades": null}], "absences": null}""", emptySet())
        assertTrue(empty.subjects.isEmpty())
        assertNull(empty.average)
        assertEquals(AbsenceStats(0, 0, 0), empty.stats)
        assertNull(empty.stand)
    }

    @Test
    fun farbeUndKuerzel() {
        assertEquals("good", gradeTone(2.5))
        assertEquals("mid", gradeTone(3.5))
        assertEquals("bad", gradeTone(3.6))
        assertEquals("none", gradeTone(null))
        assertEquals("Ma", notenBadge("ma"))
        assertEquals("Bio", notenBadge("bio"))
    }

    @Test
    fun zweiSpalten() {
        val modes = listOf(Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 21))
        // 7 предметов = 4 строки: 4 × 28 = 112 — влезает целиком
        assertEquals(7, fitColumns((1..7).toList(), 118f, modes) { it }.shown.size)
        // места на 2 строки (с «+ N weitere»): 4 самых важных, порядок прежний
        val small = fitColumns(listOf(5, 1, 6, 2, 7, 3, 4), 70f, modes) { it }
        assertEquals(listOf(1, 2, 3, 4), small.shown)
        assertEquals(3, small.hidden)
    }
}
