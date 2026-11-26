package net.orbitium.orbook.widget

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

/** Часть 50c: те же отрезки дня, что src/shared/utils/nowFocus.test.js — виджет решает так же, как блок на Start. */
class FuerDichTest {
    private val wed = LocalDate.of(2025, 9, 17)

    private fun lesson(period: Int, start: String, end: String, subject: String, status: String = "normal", room: String? = "102") =
        Lesson(period, LocalTime.parse(start), LocalTime.parse(end), status, subject, subject, null, "Web", room)

    private val lessons = listOf(
        lesson(1, "07:30", "08:15", "De"),
        lesson(2, "08:20", "09:05", "Ma", status = "substitution"),
        lesson(3, "09:25", "10:10", "En", status = "cancelled"),
        lesson(4, "10:30", "11:15", "Sp"),
    )

    private val hours = (6..18).map { WeatherHour(it, 3 + it, if (it >= 13) 61 else 2, if (it >= 13) 60 else 0) }
    private val weather = Weather("Hannover", null, listOf(
        WeatherDay(wed, 61, 17, 9, 60, 13, 18, 1.5, hours),
        WeatherDay(wed.plusDays(1), 3, 15, 8, 20, null, 14, 1.0, emptyList()),
    ))

    private fun data(
        days: List<Day> = listOf(Day(wed, "ok", null, false, lessons), Day(wed.plusDays(1), "ok", null, false, listOf(lesson(1, "07:30", "08:15", "Bi", "cancelled")))),
        appointments: List<Termin> = emptyList(),
        homework: List<Entry> = emptyList(),
        exams: List<Entry> = emptyList(),
    ) = WidgetData("9b", null, days, exams, homework, appointments, null, weather)

    private fun at(time: String, date: LocalDate = wed) = LocalDateTime.of(date, LocalTime.parse(time))
    private val settings = FuerDichSettings()

    @Test
    fun morgenVorDerSchule() {
        val f = nowFocus(data(exams = listOf(Entry(4, wed, "Ma", "Mathe", "Test"))), at("06:40"), settings)
        assertEquals("morgen", f.kind)
        assertEquals(LocalTime.of(6, 45), f.leave) // 07:30 − 45 min
        assertEquals(5L, f.leaveIn)
        assertEquals(7, f.leaveHour?.hour)
        // погода → тест → вещи; температура к выходу 10° → «Jacke», дождь 60 % → «Regenjacke»
        assertEquals(listOf("wetter:regenjacke", "wetter:jacke", "test:Mathe", "fach:Sportsachen"), f.pack.map { "${it.kind}:${it.label}" })
        // первый урок + изменённые, по времени
        assertEquals(listOf("De", "Ma", "En"), f.lessons.map { it.subject })
    }

    @Test
    fun stundeUndPause() {
        val stunde = nowFocus(data(), at("08:30"), settings)
        assertEquals("stunde", stunde.kind)
        assertEquals("Ma", stunde.lesson?.subject)
        assertEquals(36L, stunde.minutes)
        assertEquals(listOf("Sp"), stunde.after.map { it.subject }) // Englisch fällt aus — не «Danach»

        val pause = nowFocus(data(), at("09:10"), settings)
        assertEquals("pause", pause.kind)
        assertEquals("Sp", pause.lesson?.subject)
        assertEquals(81L, pause.minutes)
    }

    @Test
    fun nachmittagUndAbend() {
        val hw = listOf(Entry(7, wed.plusDays(1), "Ma", "Mathe", "S. 54"), Entry(8, wed.plusDays(1), "De", "Deutsch", "Lesen"))
        val nach = nowFocus(data(homework = hw), at("14:30"), settings, done = setOf(8))
        assertEquals("nachmittag", nach.kind)
        assertEquals(wed.plusDays(1), nach.date)
        assertEquals(listOf(7), nach.homework.map { it.id }) // erledigt — нет
        assertEquals(listOf("Bi"), nach.changes.map { it.subject })
        assertEquals(15, nach.weather?.tMax)

        assertEquals("abend", nowFocus(data(), at("19:30"), settings).kind)
        // пятница вечером → понедельник
        val fri = LocalDate.of(2025, 9, 19)
        val weekend = nowFocus(data(days = listOf(Day(fri, "ok", null, false, lessons))), at("19:30", fri), settings)
        assertEquals("abend", weekend.kind)
        assertEquals(LocalDate.of(2025, 9, 22), weekend.date)
    }

    @Test
    fun ferien() {
        val herbst = Termin("free", "Herbstferien", wed.minusDays(2), wed.plusDays(9), null)
        val f = nowFocus(data(appointments = listOf(herbst)), at("10:00"), settings)
        assertEquals("ferien", f.kind)
        assertEquals(LocalDate.of(2025, 9, 29), f.backOn) // пятница 26.9. — последний день, дальше выходные
        assertEquals(12L, f.daysFree)
    }

    @Test
    fun keinPlanHeute() {
        val f = nowFocus(data(days = listOf(Day(wed, "not_published", null, true, lessons))), at("07:00"), settings)
        assertEquals("morgen", f.kind)
        assertNull(f.leave)
        assertTrue(f.lessons.isEmpty())
    }

    @Test
    fun einstellenAusDemSnapshot() {
        val s = FuerDichSettings.from(JSONObject("""
            {"leaveMinutes": 30, "eveningFrom": "18:30", "show": {"wetter": false, "mitnehmen": true},
             "onlyMine": false, "tips": {"regenjacke": null, "jacke": 10}, "items": {"Ku": ["Zeichenblock", " "]}}
        """.trimIndent()))
        assertEquals(30, s.leaveMinutes)
        assertEquals(LocalTime.of(18, 30), s.eveningFrom)
        assertTrue(!s.shows("wetter") && s.shows("mitnehmen") && s.shows("tests"))
        assertNull(s.tips["regenjacke"])
        assertEquals(10.0, s.tips["jacke"]!!, 0.0)
        assertEquals(mapOf("Ku" to listOf("Zeichenblock")), s.items)
        // погода выключена — ни советов, ни погоды в ответе
        val f = nowFocus(data(), at("06:40"), s)
        assertNull(f.weather)
        assertTrue(f.pack.none { it.kind == "wetter" })
    }

    @Test
    fun wetterSymboleUndTexte() {
        assertEquals("cloud-sun", weatherKind(2))
        assertEquals("rain", weatherKind(61))
        assertEquals("storm", weatherKind(95))
        assertNull(weatherKind(null))
        assertEquals("Losgehen 07:05", Texts(emptyMap(), "de").t("Losgehen {time}", "07:05"))
        // вечером «Wetter» показывает завтра
        assertEquals(wed.plusDays(1), weatherDayToShow(weather, at("17:30"), settings)?.date)
        assertEquals(wed, weatherDayToShow(weather, at("07:00"), settings)?.date)
    }

    @Test
    fun wetterAusDerAntwort() {
        val w = parseWeather(JSONObject("""
            {"place": {"name": "Hannover"}, "updatedAt": "2025-09-17T04:12:00Z",
             "days": [{"date": "2025-09-17", "code": 61, "tMax": 17, "tMin": null, "rainMax": 60, "rainFrom": 13, "windMax": 18, "uvMax": null,
                       "hours": [{"hour": 7, "temp": 9, "code": 2, "rain": null}]}]}
        """.trimIndent()))
        assertEquals("Hannover", w.place)
        assertNull(w.days[0].tMin)
        assertNull(w.days[0].hours[0].rain)
        assertEquals(9, hourAt(w.days[0], LocalTime.of(7, 5))?.temp)
    }
}
