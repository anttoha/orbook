package net.orbitium.orbook.widget

import org.junit.Assert.assertEquals
import org.junit.Test

class WidgetLayoutTest {
    private val items = (1..7).toList()

    @Test
    fun allFitInNormal_rowsGetABitMoreRoom() {
        val fit = fit(items, 7 * 42f + 100, LIST_MODES) { 0 }
        assertEquals(Density.NORMAL, fit.density)
        assertEquals(items, fit.shown)
        assertEquals(0, fit.hidden)
        assertEquals(42 * 1.25f, fit.rowDp)
    }

    @Test
    fun tooTight_getsDenserInsteadOfCutting() {
        val fit = fit(items, 7 * 28f, LIST_MODES) { 0 }
        assertEquals(Density.KOMPAKT, fit.density)
        assertEquals(7, fit.shown.size)
    }

    @Test
    fun stillTooTight_keepsImportantInOrderAndCountsTheRest() {
        // 2×2: 118 dp → 4 строки dicht + «+ 3 weitere»; важнее всего 2 (идёт) и 3 (fällt aus), 1 уже прошёл
        val prio = mapOf(1 to 9, 2 to 0, 3 to 1, 4 to 2, 5 to 2, 6 to 2, 7 to 2)
        val fit = fit(items, 118f, LIST_MODES) { prio.getValue(it) }
        assertEquals(Density.DICHT, fit.density)
        assertEquals(listOf(2, 3, 4, 5), fit.shown)
        assertEquals(3, fit.hidden)
    }

    @Test
    fun atLeastOneRow() {
        val fit = fit(items, 10f, LIST_MODES) { 0 }
        assertEquals(1, fit.shown.size)
        assertEquals(6, fit.hidden)
    }

    @Test
    fun emptyList() {
        val fit = fit(emptyList<Int>(), 100f, LIST_MODES) { 0 }
        assertEquals(0, fit.shown.size)
        assertEquals(0, fit.hidden)
    }

    @Test
    fun shortTitle_onlyWhenNarrowAndLong() {
        assertEquals("Ge", shortTitle("Geschichte", "Ge", narrow = true, density = Density.KOMPAKT))
        assertEquals("Mathe", shortTitle("Mathe", "Ma", narrow = true, density = Density.KOMPAKT))
        assertEquals("Ma", shortTitle("Mathe", "Ma", narrow = true, density = Density.DICHT))
        assertEquals("Geschichte", shortTitle("Geschichte", "Ge", narrow = false, density = Density.DICHT))
    }
}
