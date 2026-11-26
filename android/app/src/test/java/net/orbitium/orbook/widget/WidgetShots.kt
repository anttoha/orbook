package net.orbitium.orbook.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.view.View
import android.widget.FrameLayout
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.compose
import androidx.glance.appwidget.provideContent
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.runBlocking
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import java.time.LocalDate

/**
 * Часть 50c: «фото» виджетов без телефона — Robolectric рисует настоящие RemoteViews Glance в PNG.
 * Обычный `test` это пропускает; снимки: WIDGET_SHOTS=/путь ./gradlew testDemoDebugUnitTest --tests '*WidgetShots*'
 * Каждый вид — один лист со всеми размерами (2×1 … 4×4), отдельно светлый и тёмный.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w411dp-h891dp-xhdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class WidgetShots {
    private val out = System.getenv("WIDGET_SHOTS")
    private val context: Context get() = ApplicationProvider.getApplicationContext()

    /** Размеры как в макетах 31d/50 (dp): колонки 2 и 4, ряды 1…4. */
    private val sizes = listOf(2 to 1, 4 to 1, 2 to 2, 4 to 2, 2 to 3, 4 to 3, 2 to 4, 4 to 4)
    private fun dp(cols: Int, rows: Int) = DpSize((if (cols == 2) 170 else 355).dp, listOf(75, 160, 250, 335)[rows - 1].dp)

    private class Shot(private val state: WidgetState) : GlanceAppWidget() {
        override val sizeMode = SizeMode.Exact
        override suspend fun provideGlance(context: Context, id: GlanceId) = provideContent { WidgetContent(context, state) }
    }

    private fun render(state: WidgetState, size: DpSize): Bitmap = runBlocking {
        val views = Shot(state).compose(context, size = size)
        val density = context.resources.displayMetrics.density
        val w = (size.width.value * density).toInt()
        val h = (size.height.value * density).toInt()
        val view: View = views.apply(context, FrameLayout(context))
        view.measure(View.MeasureSpec.makeMeasureSpec(w, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(h, View.MeasureSpec.EXACTLY))
        view.layout(0, 0, w, h)
        Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888).also { view.draw(Canvas(it)) }
    }

    // ── данные: среда 17.9.2025, как в макетах ──

    private val wed = LocalDate.of(2025, 9, 17)

    private fun lesson(p: Int, start: String, end: String, code: String, name: String, status: String = "normal", teacher: String = "Web", room: String = "102") =
        JSONObject().put("period", p).put("start", start).put("end", end).put("status", status).put("subject", code).put("name", name)
            .put("label", JSONObject.NULL).put("teacher", teacher).put("room", room).put("exam", false)

    private fun week(): JSONArray {
        val days = JSONArray()
        val monday = wed.minusDays(2)
        for (i in 0 until 10) {
            val date = monday.plusDays((i / 5 * 7 + i % 5).toLong())
            val lessons = JSONArray()
                .put(lesson(1, "07:30", "08:15", "De", "Deutsch"))
                .put(lesson(2, "08:20", "09:05", "Ma", "Mathe", if (date == wed) "substitution" else "normal", "Kle", "204"))
                .put(lesson(3, "09:25", "10:10", "En", "Englisch", if (date == wed) "cancelled" else "normal", "Mül", "105"))
                .put(lesson(4, "10:30", "11:15", "Ph", "Physik", teacher = "Ric", room = "301"))
                .put(lesson(5, "11:35", "12:20", "Ge", "Geschichte", teacher = "Bau", room = "108"))
                .put(lesson(6, "12:25", "13:10", "Sp", "Sport", teacher = "Hen", room = "Halle"))
            days.put(JSONObject().put("date", date.toString()).put("status", "ok").put("freeReason", JSONObject.NULL).put("expected", false).put("lessons", lessons))
        }
        return days
    }

    private fun hours(codes: List<Int>, temps: List<Int>, rains: List<Int>) =
        JSONArray().apply { (6..18).forEachIndexed { i, h -> put(JSONObject().put("hour", h).put("temp", temps[i]).put("code", codes[i]).put("rain", rains[i])) } }

    private fun weather(): JSONObject {
        val today = hours(listOf(2, 2, 2, 3, 3, 3, 3, 61, 61, 61, 61, 3, 3), listOf(8, 9, 10, 12, 14, 15, 16, 16, 15, 15, 14, 13, 12), listOf(0, 0, 0, 0, 0, 30, 40, 60, 70, 60, 40, 20, 10))
        fun day(offset: Long, code: Int, max: Int, min: Int, rain: Int, from: Int?, h: JSONArray) = JSONObject().put("date", wed.plusDays(offset).toString())
            .put("code", code).put("tMax", max).put("tMin", min).put("rainMax", rain).put("rainFrom", from ?: JSONObject.NULL).put("windMax", 18).put("uvMax", 1.5).put("hours", h)
        val flat = hours(List(13) { 3 }, List(13) { 8 + it.coerceAtMost(7) }, List(13) { 10 })
        return JSONObject().put("place", JSONObject().put("name", "Hannover")).put("updatedAt", "2025-09-17T04:12:00Z").put("days", JSONArray()
            .put(day(0, 61, 17, 9, 60, 13, today)).put(day(1, 3, 15, 8, 20, null, flat)).put(day(2, 0, 18, 7, 0, null, flat))
            .put(day(3, 0, 20, 9, 0, null, flat)).put(day(4, 2, 17, 10, 10, null, flat)))
    }

    private fun entry(id: Int, date: LocalDate, code: String, name: String, text: String) =
        JSONObject().put("id", id).put("date", date.toString()).put("subject", code).put("name", name).put("text", text)

    private fun data(now: String, free: Boolean = false): WidgetData {
        val o = JSONObject().put("className", "9b").put("now", now).put("days", week())
            .put("exams", JSONArray().put(entry(1, wed, "Ma", "Mathe", "Test")).put(entry(2, wed.plusDays(1), "Bi", "Biologie", "Klassenarbeit")).put(entry(3, wed.plusDays(6), "Ge", "Geschichte", "Test")))
            .put("homework", JSONArray().put(entry(7, wed.plusDays(1), "Ma", "Mathe", "S. 54, Nr. 3")).put(entry(8, wed.plusDays(1), "En", "Englisch", "Vokabeln Unit 3")))
            .put("appointments", JSONArray().apply {
                put(JSONObject().put("id", 1).put("kind", "parents").put("title", "Elternabend").put("dateFrom", wed.plusDays(1).toString()).put("dateTo", JSONObject.NULL).put("timeFrom", "19:00"))
                if (free) put(JSONObject().put("id", 2).put("kind", "free").put("title", "Herbstferien").put("dateFrom", wed.minusDays(2).toString()).put("dateTo", wed.plusDays(9).toString()).put("timeFrom", JSONObject.NULL))
            })
            .put("countdown", JSONObject().put("title", "Herbstferien").put("dateFrom", "2025-10-13").put("running", false).put("days", 18).put("progress", 0.6))
            .put("weather", weather())
        return parseWidgetData(o.toString())
    }

    private val noten = notenView(
        """{"updatedAt": "2025-09-16", "subjects": [
           {"code": "de", "name": "Deutsch", "grades": [{"date": "2025-09-12", "grade": "2", "value": 2.0, "note": "Aufsatz", "weight": 1, "half": 1}]},
           {"code": "ma", "name": "Mathematik", "grades": [{"date": "2025-09-16", "grade": "3+", "value": 2.7, "note": "Klassenarbeit 1", "weight": 2, "half": 1}]},
           {"code": "en", "name": "Englisch", "grades": [{"date": "2025-09-10", "grade": "1-", "value": 1.3, "note": "Vokabeltest", "weight": 1, "half": 1}]},
           {"code": "bi", "name": "Biologie", "grades": [{"date": "2025-09-08", "grade": "4", "value": 4.0, "note": null, "weight": 1, "half": 1}]}],
         "absences": {"days": [{"date": "2025-09-15", "excused": true, "half": 1}], "hours": [{"date": "2025-09-02", "hours": 2, "amount": "2 Stunden", "excused": false, "half": 1}]}}""",
        setOf("ma|2025-09-16|3+|Klassenarbeit 1"),
    )

    private val snapshot = Snapshot(
        classes = listOf(SnapshotClass(1, "9b", emptyList(), emptyList(), listOf("Sportsachen mitnehmen", "Referat üben"))),
        done = emptySet(), palette = emptyMap(), theme = "light", texts = Texts(emptyMap(), "de"),
    )

    private fun state(kind: String, now: String, dark: Boolean = false, design: String = "soft", free: Boolean = false) = WidgetState(
        config = WidgetConfig(kind = kind, classId = 1, look = if (dark) "dunkel" else "hell", design = design, accent = "violett", showGrades = true),
        snapshot = snapshot, data = data(now, free), status = "ok", fetchedAt = System.currentTimeMillis(), className = "9b",
        noten = if (kind in WidgetConfig.NOTEN_KINDS) noten else null,
    )

    // ── лист: все размеры одного вида на «обоях» ──

    private fun sheet(name: String, title: String, make: () -> WidgetState, dark: Boolean) {
        val d = context.resources.displayMetrics.density
        val gap = 24 * d
        val colW = floatArrayOf(170 * d, 355 * d)
        val rowH = listOf(75, 160, 250, 335).map { it * d }
        val width = (gap * 3 + colW[0] + colW[1]).toInt()
        val height = (gap * 2 + 40 * d + rowH.sumOf { (it + gap + 22 * d).toDouble() }).toInt()
        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        canvas.drawColor(if (dark) Color.rgb(0x1E, 0x1A, 0x2E) else Color.rgb(0xE6, 0xDF, 0xF8))
        val text = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = if (dark) Color.WHITE else Color.rgb(0x2A, 0x24, 0x33); textSize = 15 * d; typeface = Typeface.DEFAULT_BOLD }
        canvas.drawText(title, gap, gap + 18 * d, text)
        text.textSize = 12 * d
        var y = gap + 40 * d
        for (rows in 1..4) {
            for ((i, cols) in listOf(2, 4).withIndex()) {
                val x = if (i == 0) gap else gap * 2 + colW[0]
                canvas.drawText("$cols × $rows", x, y + 14 * d, text)
                val shot = render(make(), dp(cols, rows))
                canvas.drawBitmap(shot, null, RectF(x, y + 22 * d, x + shot.width, y + 22 * d + shot.height), null)
            }
            y += rowH[rows - 1] + gap + 22 * d
        }
        File(out, "$name-${if (dark) "dunkel" else "hell"}.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    @Test
    fun shots() {
        assumeTrue("WIDGET_SHOTS не задан — снимки не нужны", out != null)
        File(out!!).mkdirs()
        val now = "2025-09-17T10:48:00+02:00"
        val old = listOf("jetzt", "heute", "woche", "tests", "aufgaben", "aenderungen", "termine", "notizen", "countdown", "noten", "neueNoten", "fehlzeiten")
        for (dark in listOf(false, true)) {
            old.forEach { kind -> sheet("alt-$kind", kind, { state(kind, now, dark) }, dark) }
            sheet("wetter", "Wetter · 06:40", { state("wetter", "2025-09-17T06:40:00+02:00", dark) }, dark)
            val times = listOf("morgen" to "06:40", "stunde" to "10:48", "pause" to "09:10", "nachmittag" to "14:30", "abend" to "19:30")
            times.forEach { (name, time) -> sheet("fuer-dich-$name", "Für dich jetzt · $time", { state("fuerDich", "2025-09-17T$time:00+02:00", dark) }, dark) }
            sheet("fuer-dich-ferien", "Für dich jetzt · Ferien", { state("fuerDich", now, dark, free = true) }, dark)
        }
        for (design in listOf("glas", "klar")) {
            sheet("fuer-dich-morgen-$design", "Für dich jetzt · $design", { state("fuerDich", "2025-09-17T06:40:00+02:00", design = design) }, false)
            sheet("wetter-$design", "Wetter · $design", { state("wetter", "2025-09-17T06:40:00+02:00", design = design) }, false)
        }
    }
}
