package net.orbitium.orbook.noten

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Приложение должно разбирать страницу InfoPoint так же, как сервер: beispiel.json — ответ
 * `orbook/noten/parser.py` на тот же beispiel.html (бэкенд, выдуманные данные).
 */
class NotenParserTest {
    private fun resource(name: String) = javaClass.getResource("/noten/$name")!!.readText()

    @Test
    fun sameAsServer() {
        val ours = JSONObject(Json.write(NotenParser.parse(resource("beispiel.html"))))
        val server = JSONObject(resource("beispiel.json"))
        assertTrue("App:\n$ours\nServer:\n$server", ours.similar(server))
    }

    @Test
    fun values() {
        assertEquals(1.7, NotenParser.gradeValue("2+")!!, 0.0)
        assertEquals(2.3, NotenParser.gradeValue("2 −")!!, 0.0)
        assertNull(NotenParser.gradeValue("m.E."))
        assertEquals("2026-09-09", NotenParser.parseDate(" 09.09.2026 "))
        assertNull(NotenParser.parseDate("31.02.2026"))
        assertEquals(2, NotenParser.parseHalf("2. Hj."))
        assertEquals(false, NotenParser.parseExcused("unentschuldigt"))
        assertEquals(true, NotenParser.parseExcused("entschuldigt"))
        assertEquals("2026-11-16", NotenParser.parseUpdated("Letzte Aktualisierung: Montag, 16. November 2026"))
        assertEquals("2026-03-02", NotenParser.parseUpdated("Letzte Aktualisierung: 2. März 2026"))
    }

    @Test(expected = NotenParser.Denied::class)
    fun loginPageMeansDenied() {
        NotenParser.parse("<html><form><input type='password' name=\"password\"/></form><h2>Zensuren</h2></html>")
    }

    @Test(expected = NotenParser.Changed::class)
    fun otherPageMeansChanged() {
        NotenParser.parse("<html><body><h2>Wartung</h2></body></html>")
    }

    @Test
    fun entitiesAndComments() {
        val text = StringBuilder()
        Html.tokenize("<p>Er&ouml;rterung &amp; <!-- x --> &#228;&#xE4; &unknown;</p>", { _, _ -> }, {}, { text.append(it) })
        assertEquals("Erörterung &  ää &unknown;", text.toString())
    }

    @Test
    fun jsonEscapes() {
        assertEquals("""{"a":"x\"y\\z\n","b":[1,2.5,null,true]}""", Json.write(mapOf("a" to "x\"y\\z\n", "b" to listOf(1, 2.5, null, true))))
    }
}
