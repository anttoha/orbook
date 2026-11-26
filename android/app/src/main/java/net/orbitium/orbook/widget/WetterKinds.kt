package net.orbitium.orbook.widget

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ColumnScope
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import net.orbitium.orbook.R
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit

/*
 * Часть 50c: виды «Für dich jetzt» и «Wetter» (макет design/neu/50-wetter, handy-09 и handy-10).
 * Что показать — FuerDich.kt (nowFocus, как на сайте); здесь только рисуем под размер:
 * x×1 — одна строка, 2 колонки — узкий, 4×2 — с плашками, 4×3 и выше — ещё уроки и часы.
 * Не влезает — меньше строк по правилу fit() из 31d, а не обрезка посередине.
 */

private val WEATHER_ICONS = mapOf(
    "sun" to R.drawable.w_sun, "cloud-sun" to R.drawable.w_cloud_sun, "cloud" to R.drawable.w_cloud,
    "fog" to R.drawable.w_cloud_fog, "rain" to R.drawable.w_cloud_rain, "snow" to R.drawable.w_cloud_snow,
    "storm" to R.drawable.w_cloud_lightning,
)

/** Советы погоды: значок и текст (как TipChips на сайте). */
private val TIPS = mapOf(
    "regenjacke" to (R.drawable.w_umbrella to "Regenjacke"), "jacke" to (R.drawable.w_shirt to "Jacke"),
    "muetze" to (R.drawable.w_wind to "Mütze & Schal"), "sonnencreme" to (R.drawable.w_sun to "Sonnencreme"),
)

@Composable
private fun Icon(res: Int, look: Look, size: Int, color: Tone = look.p.ink) =
    Image(ImageProvider(res), null, GlanceModifier.size(size.dp), colorFilter = ColorFilter.tint(look.of(color)))

@Composable
private fun WeatherIcon(code: Int?, look: Look, size: Int, color: Tone = look.p.ink) {
    val res = WEATHER_ICONS[weatherKind(code)] ?: return
    Icon(res, look, size, color)
}

/** «60 % ab 13 Uhr» / «60 %» / «trocken»; нет данных — null. */
private fun rainLine(day: WeatherDay, t: Texts): String? {
    val max = day.rainMax ?: return null
    if (max < 20) return t.t("trocken")
    return if (day.rainFrom != null) "$max % ${t.t("ab {h} Uhr", day.rainFrom)}" else "$max %"
}

/** Плашка «что взять»: советы погоды — в цвете акцента, тест и свои вещи — песочные. */
private data class Chip(val icon: Int, val text: String, val weather: Boolean)

private fun chipsOf(pack: List<Pack>, t: Texts): List<Chip> = pack.map { p ->
    when (p.kind) {
        "wetter" -> TIPS.getValue(p.label).let { (icon, text) -> Chip(icon, t.t(text), true) }
        "test" -> Chip(R.drawable.w_flag, t.t("Test: {fach}", p.label), false)
        else -> Chip(R.drawable.w_backpack, p.label, false)
    }
}

/** Примерная ширина плашки в dp: у Glance нет переноса строк в Row — берём столько, сколько точно влезет. */
private fun chipDp(chip: Chip, scale: Float) = chip.text.length * 6.4f * scale + 36f

@Composable
private fun ChipView(chip: Chip, look: Look) {
    val p = look.p
    Row(
        GlanceModifier.height(28.dp).cornerRadius(14.dp).background(look.of(if (chip.weather) p.tint else p.sand)).padding(horizontal = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(chip.icon, look, 14, if (chip.weather) p.accentInk else p.ink)
        Spacer(GlanceModifier.width(5.dp))
        Label(chip.text, look.of(if (chip.weather) p.accentInk else p.ink), 12.5f, heavy = true)
    }
}

/** Плашки в одну строку: только те, что целиком помещаются в ширину. */
@Composable
private fun ChipRow(chips: List<Chip>, look: Look, widthDp: Float) {
    var used = 0f
    val shown = chips.takeWhile { used += chipDp(it, look.scale) + 6f; used <= widthDp }.ifEmpty { chips.take(1) }
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        shown.forEachIndexed { i, chip ->
            if (i > 0) Spacer(GlanceModifier.width(6.dp))
            ChipView(chip, look)
        }
    }
}

/** Часы 07–14: час, значок, °, дождь от 30 % — синим. Выделен час now (если есть). */
@Composable
private fun HourStrip(look: Look, day: WeatherDay, mark: Int?, compact: Boolean = false) {
    val p = look.p
    val hours = day.hours.filter { it.hour in 7..14 }
    Row(GlanceModifier.fillMaxWidth()) {
        hours.forEach { h ->
            val on = h.hour == mark
            val box = GlanceModifier.defaultWeight().padding(vertical = 4.dp)
            Column(if (on) box.cornerRadius(12.dp).background(look.of(p.tint)) else box, horizontalAlignment = Alignment.CenterHorizontally) {
                Label("%02d".format(h.hour), look.of(if (on) p.accentInk else p.faint), 11, heavy = true)
                Spacer(GlanceModifier.height(3.dp))
                // низкий виджет: строки «60 %» нет — дождливый час виден по синему значку
                val wet = (h.rain ?: 0) >= RAIN_HINT
                WeatherIcon(h.code, look, 17, if (compact && wet) Soft.rain else if (on) p.accentInk else p.muted)
                Spacer(GlanceModifier.height(3.dp))
                Label(degrees(h.temp), look.of(p.ink), 12.5f, heavy = true)
                val rain = h.rain?.takeIf { it >= RAIN_HINT }
                if (!compact) Label(if (rain != null) "$rain %" else " ", look.of(Soft.rain), 10.5f, heavy = true)
            }
        }
    }
}

// ════════════════════ Wetter ════════════════════

@Composable
internal fun ColumnScope.WetterKind(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val p = look.p
    val weather = data.weather
    val day = weather?.let { weatherDayToShow(it, now, s.snapshot.fuerDich) }
    if (weather == null || day == null) {
        Header(s, look, t.t("Wetter"), R.drawable.w_cloud_sun)
        Label(t.t("Keine Wetterdaten"), look.of(p.faint), 13); Fill(); Footer(s, look); return
    }
    val today = day.date == now.toLocalDate()
    // «Losgehen 07:05 · 9°» — только пока выход ещё впереди
    val lessons = data.days.firstOrNull { it.date == day.date }?.takeIf { it.status == "ok" }?.lessons.orEmpty()
    val leave = leaveTime(lessons, s.snapshot.fuerDich.leaveMinutes)?.takeIf { !today || it > now.toLocalTime() }
    val leaveText = leave?.let { listOfNotNull(t.t("Losgehen {time}", HHMM.format(it)), hourAt(day, it)?.temp?.let(::degrees)).joinToString(" · ") }
    val rain = rainLine(day, t)

    @Composable
    fun Temps(icon: Int, big: Int) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            WeatherIcon(day.code, look, icon)
            Spacer(GlanceModifier.width(8.dp))
            Label(degrees(day.tMax), look.of(p.ink), big, heavy = true)
            Spacer(GlanceModifier.width(5.dp))
            Label("/ ${degrees(day.tMin)}", look.of(p.faint), (big * 0.55f).coerceAtLeast(12f), bold = true)
        }
    }

    @Composable
    fun RainRow(size: Float = 12.5f) {
        val text = rain ?: return
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(R.drawable.w_droplet, look, 13, p.muted); Spacer(GlanceModifier.width(4.dp))
            Label(text, look.of(p.muted), size, bold = true)
        }
    }

    if (area.oneRow) {
        if (area.narrow) {
            Temps(24, 20); Fill(); RainRow()
        } else {
            Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Temps(32, 26)
                Spacer(GlanceModifier.defaultWeight())
                Column {
                    RainRow(13f)
                    leaveText?.let { Label(it, look.of(p.faint), 12) }
                }
            }
        }
        return
    }

    val place = weather.place
    val stand = weather.updatedAt?.atZone(ZoneId.systemDefault())?.toLocalTime()?.let { t.t("Stand {time}", HHMM.format(it)) }
    if (area.narrow) {
        Header(s, look, t.t("Wetter"), R.drawable.w_cloud_sun, right = weekday(day.date, t))
        Temps(30, 26)
        Spacer(GlanceModifier.height(8.dp))
        RainRow()
        day.windMax?.let {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(R.drawable.w_wind, look, 13, p.muted); Spacer(GlanceModifier.width(4.dp))
                Label("$it km/h", look.of(p.muted), 12.5f, bold = true)
            }
        }
        Fill()
        leaveText?.let { Label(it, look.of(p.faint), 12) }
        return
    }

    Header(s, look, listOfNotNull(t.t("Wetter"), place).joinToString(" · "), R.drawable.w_cloud_sun, right = stand)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Temps(30, 26)
        Spacer(GlanceModifier.width(16.dp))
        Column(GlanceModifier.defaultWeight()) {
            RainRow(13f)
            leaveText?.let { Label(it, look.of(p.faint), 12) }
        }
    }
    val free = freeDp(s, area.height.value) - 44f
    if (free >= 58f) { // 4×2: часы помещаются (макет handy-10)
        val mark = if (today) hourAt(day, now.toLocalTime())?.hour else leave?.let { hourAt(day, it)?.hour }
        Column(GlanceModifier.fillMaxWidth()) { Spacer(GlanceModifier.height(8.dp)); HourStrip(look, day, mark, compact = free < 80f) }
    }
    // 4×3 и выше: следующие дни
    val later = weather.days.filter { it.date > day.date }.take(4)
    if (free >= 160f && later.isNotEmpty()) {
        Column(GlanceModifier.fillMaxWidth()) {
        Spacer(GlanceModifier.height(6.dp)); Divider(look); Spacer(GlanceModifier.height(6.dp))
        Row(GlanceModifier.fillMaxWidth()) {
            later.forEach { d ->
                Column(GlanceModifier.defaultWeight(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Label(weekday(d.date, t), look.of(p.faint), 11.5f, heavy = true)
                    Spacer(GlanceModifier.height(3.dp))
                    WeatherIcon(d.code, look, 18, p.muted)
                    Spacer(GlanceModifier.height(3.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Label(degrees(d.tMax), look.of(p.ink), 12.5f, heavy = true)
                        Spacer(GlanceModifier.width(3.dp))
                        Label(degrees(d.tMin), look.of(p.faint), 12)
                    }
                }
            }
        }
        }
    }
    Fill(); Footer(s, look)
}

// ════════════════════ Für dich jetzt ════════════════════

@Composable
internal fun ColumnScope.FuerDichKind(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val focus = nowFocus(data, now, s.snapshot.fuerDich, s.snapshot.done.toSet())
    when (focus.kind) {
        "stunde", "pause" -> Jetzt(s, data, look, now) // урок и перемена — как вид «Jetzt»
        "morgen" -> Morgen(s, look, focus)
        "ferien" -> Ferien(s, look, focus, now.toLocalDate())
        else -> Ahead(s, look, focus, now.toLocalDate())
    }
}

/** Справа у урока: «fällt aus», «Vertretung · Kle · 204» или «Web · 102» (lessonAside). */
private fun aside(lesson: Lesson, t: Texts, changes: Boolean): Pair<String, Int> = when {
    changes && lesson.cancelled -> t.t("fällt aus") to 2
    changes && lesson.status in setOf("substitution", "moved", "added") -> listOf(t.t("Vertretung"), lesson.place).filter { it.isNotEmpty() }.joinToString(" · ") to 1
    changes && lesson.status == "room_change" -> t.t("Raum {n}", lesson.room ?: "") to 1
    else -> lesson.place to 0
}

@Composable
private fun FocusLesson(s: WidgetState, look: Look, lesson: Lesson, rowDp: Float, narrow: Boolean) {
    val t = s.texts
    val p = look.p
    val (text, tone) = aside(lesson, t, s.snapshot.fuerDich.shows("aenderungen"))
    Row(GlanceModifier.fillMaxWidth().height(rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
        if (!narrow) Box(GlanceModifier.width(44.dp)) { Label(lesson.start?.let(HHMM::format) ?: "", look.of(p.faint), 12.5f) }
        Dot(look.of(if (lesson.cancelled) p.danger else Soft.fach(lesson.subject, s.snapshot.palette).solid), 8)
        Spacer(GlanceModifier.width(8.dp))
        Box(GlanceModifier.defaultWeight()) {
            Label(s.title(lesson, narrow, Density.KOMPAKT), look.of(if (lesson.cancelled) p.danger else p.ink), 14, bold = true, strike = lesson.cancelled)
        }
        Label(text, look.of(when (tone) { 2 -> p.danger; 1 -> p.accentInk; else -> p.faint }), 12, bold = tone > 0)
    }
}

/** «07:30 Deutsch · Web · 102» — первый урок одной строкой. */
@Composable
private fun FirstLine(s: WidgetState, look: Look, lesson: Lesson?, wide: Boolean, size: Float = 13f) {
    lesson ?: return
    Row(verticalAlignment = Alignment.CenterVertically) {
        Label(lesson.start?.let(HHMM::format) ?: "", look.of(look.p.ink), size, heavy = true)
        Spacer(GlanceModifier.width(5.dp))
        Label(listOf(lesson.title, if (wide) lesson.place else "").filter { it.isNotEmpty() }.joinToString(" · "), look.of(look.p.muted), size)
    }
}

/** Утро до выхода: погода к выходу, что взять, первые уроки (макет handy-09). */
@Composable
private fun ColumnScope.Morgen(s: WidgetState, look: Look, f: Focus) {
    val t = s.texts
    val p = look.p
    val area = area()
    val w = f.weather
    val temp = degrees(f.leaveHour?.temp ?: w?.tMax)
    val leaveIn = f.leaveIn
    val right = when { leaveIn == null -> null; leaveIn <= 0 -> t.t("los!"); else -> t.t("los in {n} min", leaveIn) }
    val chips = chipsOf(f.pack, t)
    val first = f.lessons.firstOrNull { !it.cancelled }
    val width = area.width.value - 28f
    val leave = f.leave?.let(HHMM::format)

    @Composable
    fun Big(icon: Int, size: Int) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (w != null) {
                WeatherIcon(f.leaveHour?.code ?: w.code, look, icon); Spacer(GlanceModifier.width(8.dp)); Label(temp, look.of(p.ink), size, heavy = true)
            } else {
                Label(leave ?: "", look.of(p.ink), size, heavy = true)
            }
        }
    }

    if (area.oneRow) {
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Big(22, 18)
            if (area.narrow) {
                Spacer(GlanceModifier.defaultWeight())
                leave?.let { Label(it, look.of(p.accentInk), 12.5f, heavy = true) }
            } else {
                Spacer(GlanceModifier.width(12.dp))
                leave?.let { Label(t.t("Losgehen {time}", it), look.of(p.ink), 13, heavy = true) }
                first?.let { Label(" · ${it.start?.let(HHMM::format) ?: ""} ${it.title}", look.of(p.muted), 13) }
            }
        }
        Fill()
        if (chips.isNotEmpty()) ChipRow(chips, look, width)
        return
    }

    if (area.narrow) {
        Header(s, look, t.t("Für dich"), R.drawable.w_sparkle, accent = true, right = leave)
        Big(30, 26)
        Spacer(GlanceModifier.height(8.dp))
        // плашки столбиком — сколько влезет над первым уроком
        val room = freeDp(s, area.height.value) - 40f - 22f
        val fitted = fit(chips, room, listOf(Mode(Density.NORMAL, 34))) { chips.indexOf(it) }
        // своя колонка: Glance показывает не больше 10 элементов в одной
        Column { fitted.shown.forEach { ChipView(it, look); Spacer(GlanceModifier.height(6.dp)) } }
        Fill()
        FirstLine(s, look, first, wide = false)
        return
    }

    Header(s, look, t.t("Für dich jetzt"), R.drawable.w_sparkle, accent = true, right = right)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Big(36, 30)
        Spacer(GlanceModifier.width(14.dp))
        Column(GlanceModifier.defaultWeight()) {
            leave?.let { Label(t.t("Losgehen {time}", it), look.of(p.muted), 13, heavy = true) }
            val line = listOfNotNull(w?.tMax?.let { t.t("Heute bis {t}°", it) }, w?.rainFrom?.let { t.t("Regen {from}", t.t("ab {h} Uhr", it)) })
            if (line.isNotEmpty()) Label(line.joinToString(" · "), look.of(p.faint), 12)
        }
    }
    if (chips.isNotEmpty()) { Spacer(GlanceModifier.height(8.dp)); ChipRow(chips, look, width) }

    var free = freeDp(s, area.height.value) - 46f - (if (chips.isNotEmpty()) 36f else 0f)
    val strip = w != null && free >= 80f + 3 * 28f
    if (strip) free -= 80f
    val changes = f.lessons.count { it.cancelled || it.changed }
    if (free >= 2 * 28f && f.lessons.isNotEmpty()) {
        // 4×3 и выше: первые уроки и изменения строками (handy-09 4×4)
        val fitted = fit(f.lessons, free - 14f, listOf(Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 22))) { if (it.cancelled || it.changed || it == first) 0 else 1 }
        Column(GlanceModifier.fillMaxWidth()) {
            Spacer(GlanceModifier.height(8.dp)); Divider(look); Spacer(GlanceModifier.height(4.dp))
            fitted.shown.forEach { FocusLesson(s, look, it, fitted.rowDp, narrow = false) }
            More(s, look, fitted.hidden)
        }
    } else {
        Fill()
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(GlanceModifier.defaultWeight()) { FirstLine(s, look, first, wide = true) }
            if (changes > 0) Label("+ " + t.t("{n} Änderungen", changes), look.of(p.accentInk), 12.5f, heavy = true)
        }
    }
    if (strip && w != null) {
        Fill()
        Column(GlanceModifier.fillMaxWidth()) { Divider(look); Spacer(GlanceModifier.height(6.dp)); HourStrip(look, w, f.leaveHour?.hour) }
    }
    Footer(s, look)
}

/** Строка списка «Für morgen» / «Nächster Schultag»: значок, текст, справа срок. */
private data class AheadRow(val icon: Int?, val dot: String?, val text: String, val right: String, val tone: Int, val prio: Int, val lesson: Lesson? = null)

/** После уроков и вечером: следующий учебный день — задания, уроки с изменениями, тесты (handy-02). */
@Composable
private fun ColumnScope.Ahead(s: WidgetState, look: Look, f: Focus, today: LocalDate) {
    val t = s.texts
    val p = look.p
    val area = area()
    val date = f.date ?: return
    val title = if (f.kind == "nachmittag") t.t("Für morgen") else t.t("Nächster Schultag")
    val weatherRight = f.weather?.let { "${degrees(it.tMax)} / ${degrees(it.tMin)}" }
    val dayName = when (ChronoUnit.DAYS.between(today, date)) { 1L -> t.t("Morgen"); else -> dayLabel(date, t) }

    if (area.oneRow) {
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Icon(R.drawable.w_sparkle, look, 14, p.accentInk); Spacer(GlanceModifier.width(6.dp))
            Box(GlanceModifier.defaultWeight()) { Label(dayName, look.of(p.ink), 15, heavy = true) }
            f.weather?.let { WeatherIcon(it.code, look, 16, p.muted); Spacer(GlanceModifier.width(4.dp)); Label(degrees(it.tMax), look.of(p.ink), 13, heavy = true) }
        }
        Fill()
        FirstLine(s, look, f.first, wide = !area.narrow, size = 12.5f)
        return
    }

    Header(s, look, title, R.drawable.w_sparkle, accent = true, right = if (area.narrow) f.weather?.let { degrees(it.tMax) } else weatherRight)
    Label(dayName, look.of(p.ink), if (area.narrow) 17 else 19, heavy = true)
    FirstLine(s, look, f.first, wide = !area.narrow, size = 12.5f)

    val rows = buildList {
        f.homework.forEach { add(AheadRow(R.drawable.w_list_check, null, "${it.title} · ${it.text}", if (it.date == today.plusDays(1)) t.t("bis morgen") else t.t("bis {n}", weekday(it.date, t)), 1, 0)) }
        f.exams.forEach { add(AheadRow(R.drawable.w_flag, null, t.t("Test: {fach}", it.title), "${weekday(it.date, t)} ${it.date.dayOfMonth}.${it.date.monthValue}.", 0, 1)) }
        f.changes.forEach { add(AheadRow(R.drawable.w_refresh, null, it.title, aside(it, t, true).first, if (it.cancelled) 2 else 1, 2, it)) }
    }
    val free = freeDp(s, area.height.value) - 46f
    if (rows.isNotEmpty() && free >= 28f) {
        val fitted = fit(rows, free - 10f, listOf(Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 22))) { it.prio }
        Column(GlanceModifier.fillMaxWidth()) {
        Spacer(GlanceModifier.height(6.dp)); Divider(look); Spacer(GlanceModifier.height(2.dp))
        fitted.shown.forEach { r ->
            Row(GlanceModifier.fillMaxWidth().height(fitted.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
                r.icon?.let { Icon(it, look, 14, if (r.tone == 2) p.danger else p.muted); Spacer(GlanceModifier.width(8.dp)) }
                Box(GlanceModifier.defaultWeight()) { Label(r.text, look.of(if (r.tone == 2) p.danger else p.ink), 13, bold = true, strike = r.lesson?.cancelled == true) }
                if (!area.narrow && r.right.isNotEmpty()) Label(r.right, look.of(when (r.tone) { 2 -> p.danger; 1 -> p.accentInk; else -> p.faint }), 12, bold = true)
            }
        }
        More(s, look, fitted.hidden)
        }
    }
    Fill(); Footer(s, look)
}

/** Каникулы: сколько дней свободно и когда снова школа. */
@Composable
private fun ColumnScope.Ferien(s: WidgetState, look: Look, f: Focus, today: LocalDate) {
    val t = s.texts
    val p = look.p
    val area = area()
    val item = f.ferien ?: return
    val back = f.backOn ?: return
    val days = f.daysFree ?: 0
    if (!area.oneRow) Header(s, look, item.title, R.drawable.w_sun, accent = true, right = f.weather?.let { degrees(it.tMax) })
    Row(verticalAlignment = Alignment.Bottom) {
        Label("$days", look.of(p.ink), if (area.oneRow) 22 else 30, heavy = true)
        Spacer(GlanceModifier.width(6.dp))
        Box(GlanceModifier.padding(bottom = 4.dp)) { Label(t.t("Tage frei"), look.of(p.muted), 13, bold = true) }
    }
    Label(t.t("Schule wieder {date}", if (area.narrow) weekday(back, t) else dayLabel(back, t)), look.of(p.muted), 12.5f)
    val total = ChronoUnit.DAYS.between(item.from, back).coerceAtLeast(1)
    Spacer(GlanceModifier.height(8.dp))
    Bar(look, ChronoUnit.DAYS.between(item.from, today).toFloat() / total)
    val free = freeDp(s, area.height.value) - 80f
    if (!area.narrow && free >= 28f) {
        Column(GlanceModifier.fillMaxWidth()) {
        Spacer(GlanceModifier.height(6.dp))
        f.exams.forEach { e ->
            Row(GlanceModifier.fillMaxWidth().height(28.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(R.drawable.w_flag, look, 14, p.muted); Spacer(GlanceModifier.width(8.dp))
                Box(GlanceModifier.defaultWeight()) { Label(t.t("Test: {fach}", e.title), look.of(p.ink), 13, bold = true) }
                Label("${weekday(e.date, t)} ${e.date.dayOfMonth}.${e.date.monthValue}.", look.of(p.faint), 12)
            }
        }
        }
    }
    Fill(); Footer(s, look)
}
