package net.orbitium.orbook.widget

/**
 * Часть 31d. Правило содержания виджета — одно на все виды и любой размер
 * (макет: design/neu/31d-widget-design, там же fit() в gen.py):
 *   1) важность: урок, который идёт или будет следующим → отмены и замены → остальное → уже прошедшее;
 *   2) не влезает — строки плотнее (две строки → одна → мельче), а не обрезка;
 *   3) и так не влезает — самые важные в обычном порядке + внизу «+ N weitere».
 * Чистые функции без Android — их проверяет WidgetLayoutTest.
 */
enum class Density { NORMAL, ZWEI, KOMPAKT, DICHT }

/** Режим строки: плотность и высота строки в dp. */
data class Mode(val density: Density, val dp: Int)

/** Что рисовать: плотность, высота строки, видимые строки и сколько спрятано за «+ N weitere». */
data class Fit<T>(val density: Density, val rowDp: Float, val shown: List<T>, val hidden: Int)

/** Место под строку «+ N weitere». */
const val MORE_DP = 18f

/** Обычные режимы списков: две строки → одна → одна мельче. */
val LIST_MODES = listOf(Mode(Density.NORMAL, 42), Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 21))

fun <T> fit(items: List<T>, availDp: Float, modes: List<Mode>, prio: (T) -> Int): Fit<T> {
    modes.forEachIndexed { i, mode ->
        if (items.size * mode.dp <= availDp) {
            // места больше, чем нужно в самом просторном режиме — строки чуть свободнее (до +25 %)
            val dp = if (i == 0 && items.isNotEmpty()) minOf(availDp / items.size, mode.dp * 1.25f) else mode.dp.toFloat()
            return Fit(mode.density, dp, items, 0)
        }
    }
    val last = modes.last()
    val count = ((availDp - MORE_DP) / last.dp).toInt().coerceIn(1, items.size)
    // sortedBy устойчивая: при равной важности остаётся обычный порядок
    val keep = items.withIndex().sortedBy { prio(it.value) }.take(count).sortedBy { it.index }.map { it.value }
    return Fit(last.density, last.dp.toFloat(), keep, items.size - count)
}

/** Важность урока для «Heute» и «Danach»: меньше — важнее. */
fun lessonPriority(lesson: Lesson, isNow: Boolean, past: Boolean): Int = when {
    isNow -> 0
    past -> 9
    lesson.cancelled || lesson.changed -> 1
    else -> 2
}

/** Длинное название в узкой строке → Kürzel («Geschichte» → «Ge»), а не «Geschi…». */
fun shortTitle(name: String, code: String, narrow: Boolean, density: Density): String =
    if (narrow && (density == Density.DICHT || name.length > 7)) code else name
