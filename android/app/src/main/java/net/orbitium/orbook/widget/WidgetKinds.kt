package net.orbitium.orbook.widget

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.appwidget.LinearProgressIndicator
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
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.temporal.ChronoUnit
import java.time.temporal.IsoFields

/*
 * Часть 31d: девять видов виджета (макет design/neu/31d-widget-design).
 * Каждый вид смотрит на свой размер: одна строка рабочего стола (x×1), узкий (2 колонки) или широкий,
 * и списки отдаёт правилу fit() — плотнее строки, а не обрезка; что не влезло — «+ N weitere».
 */

/** Размер виджета словами: узкий (2 колонки), в одну строку рабочего стола, сколько места под строками. */
private class Area(val width: Dp, val height: Dp) {
    val narrow get() = width < 200.dp
    val oneRow get() = height < 110.dp
}

@Composable
private fun area() = LocalSize.current.let { Area(it.width, it.height) }

private fun Lesson.past(today: Boolean, time: LocalTime) = today && end != null && end <= time
private fun Lesson.running(today: Boolean, time: LocalTime) = today && start != null && end != null && time >= start && time < end

@Composable
private fun Bar(look: Look, progress: Float, color: Tone = look.p.accent) =
    LinearProgressIndicator(progress.coerceIn(0f, 1f), GlanceModifier.fillMaxWidth().height(5.dp), look.of(color), look.of(look.p.sand))

// ════════════════════ Jetzt ════════════════════

@Composable
internal fun ColumnScope.Jetzt(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val current = nowOf(data.days, now) ?: return NextDay(s, data, look, now)
    val area = area()
    val lesson = current.lesson
    val start = lesson.start!!
    val end = lesson.end!!
    val time = now.toLocalTime()
    val minutes = Duration.between(time, if (current.running) end else start).toMinutes() + 1
    val right = if (current.running) t.t("noch {n} min", minutes) else t.t("in {n} min", minutes)
    val head = if (current.running) t.t("Jetzt") else t.t("Gleich")
    val progress = Duration.between(start, time).toMinutes().toFloat() / Duration.between(start, end).toMinutes().coerceAtLeast(1)
    val showBar = current.running && s.config.progress
    val place = s.place(lesson, !area.narrow)
    val sub = listOfNotNull(if (lesson.changed) t.t("Vertretung") else null, place.ifEmpty { null })

    if (area.oneRow) {
        // x×1: только то, что идёт сейчас
        if (area.narrow) {
            Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(GlanceModifier.defaultWeight()) { Label(lesson.title, look.of(look.p.ink), 17, heavy = true) }
                Label(right, look.of(look.p.accentInk), 12, heavy = true)
            }
            Label(sub.joinToString(" · "), look.of(if (lesson.changed) look.p.accentInk else look.p.muted), 12, bold = lesson.changed)
        } else {
            Header(s, look, "$head · ${t.t("{n}. Stunde", lesson.period)}", R.drawable.w_clock, accent = true, right = right)
            Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Label(lesson.title, look.of(look.p.ink), 15, heavy = true)
                Spacer(GlanceModifier.width(8.dp))
                Box(GlanceModifier.defaultWeight()) { Label(sub.joinToString(" · "), look.of(if (lesson.changed) look.p.accentInk else look.p.muted), 13, bold = lesson.changed) }
                Label(t.t("bis {n}", HHMM.format(end)), look.of(look.p.faint), 12)
            }
        }
        Fill()
        if (showBar) Bar(look, progress, Soft.fach(lesson.subject, s.snapshot.palette).solid)
        return
    }

    Header(s, look, if (area.narrow) head else "$head · ${t.t("{n}. Stunde", lesson.period)}", R.drawable.w_clock, accent = true, right = if (area.narrow) null else right)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(GlanceModifier.defaultWeight()) { Label(lesson.title, look.of(look.p.ink), if (area.narrow) 20 else 22, heavy = true) }
        Label(if (area.narrow) right else "${HHMM.format(start)}–${HHMM.format(end)}", look.of(if (area.narrow) look.p.accentInk else look.p.faint), 12, bold = area.narrow)
    }
    if (area.narrow) {
        if (lesson.changed) Label(t.t("Vertretung"), look.of(look.p.accentInk), 12, heavy = true)
        Label(listOfNotNull(lesson.teacher, lesson.room?.let { t.t("Raum {n}", it) }).joinToString(" · "), look.of(look.p.muted), 12)
    } else {
        Label(sub.joinToString(" · "), look.of(if (lesson.changed) look.p.accentInk else look.p.muted), 13, bold = lesson.changed)
    }
    Spacer(GlanceModifier.height(8.dp))
    if (showBar) { Bar(look, progress, Soft.fach(lesson.subject, s.snapshot.palette).solid); Spacer(GlanceModifier.height(8.dp)) }
    val cancelled = current.nextCancelled
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Row(GlanceModifier.defaultWeight(), verticalAlignment = Alignment.CenterVertically) {
            if (cancelled != null) {
                Dot(look.of(look.p.danger), 7); Spacer(GlanceModifier.width(6.dp))
                if (!area.narrow) Label("${cancelled.start?.let(HHMM::format)} · ", look.of(look.p.danger), 12, bold = true)
                Label(cancelled.title, look.of(look.p.danger), 12, bold = true, strike = true)
                Label(" " + t.t("fällt aus"), look.of(look.p.danger), 12, bold = true)
            }
        }
        if (!area.narrow) current.after?.let { Label(t.t("dann {n}", "${it.title} · ${it.start?.let(HHMM::format)}"), look.of(look.p.faint), 12) }
    }

    // 4×3 и выше: «Danach» — следующие уроки тем же правилом, что «Heute»
    val today = data.days.firstOrNull { it.date == now.toLocalDate() }
    val rest = today?.lessons.orEmpty().filter { it.start != null && it.start > start && !(s.hideCancelled && it.cancelled) }
    val used = 150f + (if (showBar) 13f else 0f)
    val free = freeDp(s, area.height.value, header = false) - used - 26f
    if (!area.narrow && s.config.next && rest.isNotEmpty() && free >= 21f) {
        Spacer(GlanceModifier.height(8.dp)); Divider(look); Spacer(GlanceModifier.height(6.dp))
        Label(t.t("Danach"), look.of(look.p.faint), 12, heavy = true)
        Spacer(GlanceModifier.height(4.dp))
        LessonRows(s, look, rest, today = true, time = time, free = free, narrow = false)
    }
    Fill(); Footer(s, look)
}

/** Уроков сегодня больше нет: первый урок следующего учебного дня («Wochenende» / «Morgen»). */
@Composable
private fun ColumnScope.NextDay(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val day = data.days.firstOrNull { it.date > now.toLocalDate() && it.hasLessons }
    val weekend = day != null && day.date.dayOfWeek.value < now.dayOfWeek.value || now.dayOfWeek.value >= 6
    val title = when {
        day == null -> t.t("Frei")
        weekend -> t.t("Wochenende")
        day.date == now.toLocalDate().plusDays(1) -> t.t("Morgen")
        else -> weekday(day.date, t)
    }
    val narrow = area().narrow
    Header(s, look, title, R.drawable.w_sun, accent = true, right = if (narrow) null else day?.let { dayLabel(it.date, t) })
    val first = day?.lessons?.filter { !it.cancelled }?.minByOrNull { it.period }
    if (first == null) { Empty(look, t.t("Kein Unterricht")); Fill(); return }
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(GlanceModifier.defaultWeight()) { Label(first.title, look.of(look.p.ink), if (narrow) 18 else 22, heavy = true) }
        if (!narrow && first.start != null && first.end != null) Label("${HHMM.format(first.start)}–${HHMM.format(first.end)}", look.of(look.p.faint), 12)
    }
    Label(listOfNotNull(t.t("{n}. Stunde", first.period), first.room?.let { t.t("Raum {n}", it) }).joinToString(" · "), look.of(look.p.muted), 12)
    Fill()
    val changes = day.lessons.count { it.cancelled || it.changed }
    if (changes == 0) Empty(look, t.t("Keine Änderungen"))
    else Label(t.t("{n} Änderungen", changes), look.of(look.p.accentInk), 12, bold = true)
    Footer(s, look)
}

// ════════════════════ Heute ════════════════════

@Composable
internal fun ColumnScope.Heute(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val day = dayToShow(data.days, now, s.config.evening)
    val isToday = day?.date == now.toLocalDate()
    var lessons = day?.lessons.orEmpty()
    if (s.hideCancelled) lessons = lessons.filter { !it.cancelled }
    if (s.config.onlyChanges) lessons = lessons.filter { it.cancelled || it.changed }
    val name = when {
        day == null || isToday -> t.t("Heute")
        day.date == now.toLocalDate().plusDays(1) -> t.t("Morgen")
        else -> weekday(day.date, t)
    }
    val count = day?.lessons.orEmpty().count { !it.cancelled }
    val title = if (count > 0 && !area.narrow) "$name · ${t.t(if (count == 1) "{n} Stunde" else "{n} Stunden", count)}" else name
    val lastEnd = day?.lessons?.mapNotNull { it.end }?.maxOrNull()
    Header(s, look, title, R.drawable.w_list, right = if (!area.narrow && lastEnd != null) t.t("bis {n}", HHMM.format(lastEnd)) else null)
    if (lessons.isEmpty()) {
        Empty(look, t.t(if (s.config.onlyChanges) "Keine Änderungen" else "Kein Unterricht")); Fill(); Footer(s, look); return
    }
    LessonRows(s, look, lessons, isToday, now.toLocalTime(), freeDp(s, area.height.value), area.narrow)
    Fill(); Footer(s, look)
}

/** Строки уроков по правилу 31d: normal — 2 строки, kompakt — 1, dicht — 1 мельче; лишнее — «+ N weitere». */
@Composable
internal fun LessonRows(s: WidgetState, look: Look, lessons: List<Lesson>, today: Boolean, time: LocalTime, free: Float, narrow: Boolean) {
    val next = if (today) lessons.firstOrNull { !it.cancelled && (it.end == null || it.end > time) } else null
    val fit = fit(lessons, free, LIST_MODES) { lessonPriority(it, it == next, it.past(today, time)) }
    fit.shown.forEachIndexed { i, lesson ->
        if (i > 0) Divider(look)
        LessonRow(s, look, lesson, fit.density, fit.rowDp, lesson.running(today, time), lesson.past(today, time), narrow)
    }
    More(s, look, fit.hidden)
}

@Composable
private fun LessonRow(s: WidgetState, look: Look, lesson: Lesson, density: Density, rowDp: Float, now: Boolean, past: Boolean, narrow: Boolean) {
    val t = s.texts
    val p = look.p
    val fs = when (density) { Density.NORMAL -> 14; Density.DICHT -> 12; else -> 13 }
    val nameColor = when { lesson.cancelled -> p.danger; past -> p.faint; else -> p.ink }
    val vert = lesson.changed && lesson.status != "room_change"
    val mod = GlanceModifier.fillMaxWidth().height(rowDp.dp).padding(horizontal = 6.dp)
    Row(if (now) mod.cornerRadius(look.cellRadius.dp).background(look.of(p.tint)) else mod, verticalAlignment = Alignment.CenterVertically) {
        Box(GlanceModifier.width(18.dp)) { Label("${lesson.period}", look.of(if (past) p.faint else p.ink), fs - 0.5f, heavy = true) }
        if (density == Density.KOMPAKT && !narrow) Box(GlanceModifier.width(42.dp)) { Label(lesson.start?.let(HHMM::format) ?: "", look.of(p.faint), 11) }
        Dot(look.of(if (lesson.cancelled) p.danger else Soft.fach(lesson.subject, s.snapshot.palette).solid), 8)
        Spacer(GlanceModifier.width(7.dp))
        if (density == Density.NORMAL) {
            Column(GlanceModifier.defaultWeight()) {
                Label(s.title(lesson, narrow, density), look.of(nameColor), fs, heavy = true, strike = lesson.cancelled)
                val times = listOfNotNull(lesson.start?.let(HHMM::format), lesson.end?.let(HHMM::format)).joinToString("–")
                when {
                    // узко: статус уходит во вторую строку, а не налезает на предмет
                    narrow && lesson.cancelled -> Label(t.t("fällt aus"), look.of(p.danger), 11.5f, heavy = true)
                    narrow && vert -> Label(listOfNotNull(t.t("Vertretung"), lesson.room).joinToString(" · "), look.of(p.accentInk), 11.5f, heavy = true)
                    narrow -> Label(listOfNotNull(lesson.start?.let(HHMM::format), lesson.room).joinToString(" · "), look.of(p.faint), 11.5f)
                    else -> Label(listOf(times, s.place(lesson, true)).filter { it.isNotEmpty() }.joinToString(" · "), look.of(p.faint), 11.5f)
                }
            }
            if (!narrow && lesson.cancelled) Label(t.t("fällt aus"), look.of(p.danger), 12, heavy = true)
            else if (!narrow && vert) Label(t.t("Vertretung"), look.of(p.accentInk), 12, heavy = true)
            return@Row
        }
        Box(GlanceModifier.defaultWeight()) { Label(s.title(lesson, narrow, density), look.of(nameColor), fs, bold = true, strike = lesson.cancelled) }
        val size = if (density == Density.DICHT) 11.5f else 12f
        when {
            lesson.cancelled -> Label(t.t("fällt aus"), look.of(p.danger), size, heavy = true)
            vert -> Label(if (narrow) listOfNotNull(t.t("Vertr."), lesson.room).joinToString(" · ") else listOf(t.t("Vertretung"), s.place(lesson, true)).filter { it.isNotEmpty() }.joinToString(" · "), look.of(p.accentInk), size, bold = true)
            lesson.status == "room_change" -> Label(t.t("Raum {n}", lesson.room ?: ""), look.of(p.accentInk), size, bold = true)
            else -> Label(s.place(lesson, !narrow), look.of(p.faint), size)
        }
    }
}

// ════════════════════ Woche ════════════════════

@Composable
internal fun ColumnScope.Woche(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val weekend = now.dayOfWeek.value >= 6
    val days = if (weekend && s.config.weekend == "leer") emptyList() else weekToShow(data.days, now)
    val week = (days.firstOrNull()?.date ?: now.toLocalDate()).get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
    val title = if (area.narrow) "${t.t("KW")} $week" else "${t.t("Woche")} · ${t.t("KW")} $week"
    if (days.isEmpty()) { Header(s, look, title, R.drawable.w_week, chip = true); Label(t.t("Wochenende"), look.of(look.p.faint), 13); Fill(); return }
    val periods = days.flatMap { d -> d.lessons.map { it.period } }.distinct().sorted()
    // Показываем ВСЕ уроки недели: высота ячейки подбирается под виджет, а не наоборот
    val gap = if (periods.size > 6 || area.height < 200.dp) 2 else 4
    val free = freeDp(s, area.height.value)
    val cell = WeekCellSize.of(free - 16, periods.size, gap, s.config.cell)
    // Широкий и низкий (4×2, 5×2): 8–10 уроков в высоту не влезают с текстом — поворачиваем неделю:
    // дни строками, уроки столбцами. Строк всего 5, и в клетке хватает места на Kürzel.
    // Совсем низкий — ещё и без шапки «Woche · KW»: важнее предметы, чем номер недели
    if (!cell.text && !area.narrow) {
        val across = WeekCellSize.of(free, days.size, 2, "kuerzel")
        val bare = WeekCellSize.of(freeDp(s, area.height.value, header = false), days.size, 2, "kuerzel")
        if (across.text || bare.text) {
            if (across.text) Header(s, look, title, R.drawable.w_week, chip = true)
            WeekAcross(s, look, days, periods, if (across.text) across else bare, now)
            Fill(); Footer(s, look)
            return
        }
    }
    Header(s, look, title, R.drawable.w_week, chip = true)
    Row(GlanceModifier.fillMaxWidth()) {
        days.forEach { d ->
            Box(GlanceModifier.defaultWeight().padding(bottom = 3.dp), contentAlignment = Alignment.Center) {
                val wd = weekday(d.date, t).uppercase()
                Label(if (area.narrow) wd.take(1) else wd, look.of(if (d.date == now.toLocalDate()) look.p.accent else look.p.faint), 10.5f, heavy = true)
            }
        }
    }
    periods.forEach { period ->
        Row(GlanceModifier.fillMaxWidth().padding(bottom = gap.dp)) {
            days.forEach { d ->
                val all = d.lessons.filter { it.period == period && !(s.hideCancelled && it.cancelled) }
                val lesson = all.firstOrNull { !it.cancelled } ?: all.firstOrNull()
                Box(GlanceModifier.defaultWeight().padding(horizontal = (gap / 2f).dp)) { WeekCell(s, look, lesson, cell) }
            }
        }
    }
    Fill(); Footer(s, look)
}

/** Неделя «лёжа»: слева буква дня (сегодня — цветом акцента), справа уроки дня по порядку. */
@Composable
private fun WeekAcross(s: WidgetState, look: Look, days: List<Day>, periods: List<Int>, cell: WeekCellSize, now: LocalDateTime) {
    days.forEach { d ->
        Row(GlanceModifier.fillMaxWidth().padding(bottom = 2.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(GlanceModifier.width(24.dp), contentAlignment = Alignment.CenterStart) {
                Label(weekday(d.date, s.texts).uppercase(), look.of(if (d.date == now.toLocalDate()) look.p.accent else look.p.faint), 10, heavy = true)
            }
            periods.forEach { period ->
                val all = d.lessons.filter { it.period == period && !(s.hideCancelled && it.cancelled) }
                val lesson = all.firstOrNull { !it.cancelled } ?: all.firstOrNull()
                Box(GlanceModifier.defaultWeight().padding(horizontal = 1.dp)) { WeekCell(s, look, lesson, cell) }
            }
        }
    }
}

/** Ячейка недели: чем больше места, тем больше в ней написано (не больше, чем разрешено в «In der Zelle»). */
private class WeekCellSize(val height: Int, val room: Boolean, val teacher: Boolean, val fontSize: Float, val text: Boolean) {
    companion object {
        fun of(free: Float, periods: Int, gap: Int, detail: String): WeekCellSize {
            val h = (free / periods.coerceAtLeast(1)).toInt() - gap
            val room = detail != "kuerzel"
            val teacher = detail == "lehrkraft"
            // строка текста Android занимает больше, чем размер шрифта (отступы шрифта): 11 sp ≈ 17 dp, 9,5 sp ≈ 15 dp
            return when {
                h >= 48 -> WeekCellSize(minOf(h, 60), room, teacher, 12.5f, true)
                h >= 34 -> WeekCellSize(h, room, false, 12.5f, true)
                h >= 19 -> WeekCellSize(h, false, false, 11f, true)
                h >= 15 -> WeekCellSize(h, false, false, 9.5f, true)
                else -> WeekCellSize(h.coerceAtLeast(6), false, false, 9.5f, false) // только цвет
            }
        }
    }
}

@Composable
private fun WeekCell(s: WidgetState, look: Look, lesson: Lesson?, cell: WeekCellSize) {
    val radius = if (cell.height < 20) minOf(look.cellRadius, 5) else look.cellRadius
    val mod = GlanceModifier.fillMaxWidth().height(cell.height.dp).cornerRadius(radius.dp)
    if (lesson == null) return Box(mod.background(look.of(look.p.sand))) {}
    val fach = Soft.fach(lesson.subject, s.snapshot.palette)
    val bg = if (lesson.cancelled) look.p.dangerTint else fach.tint
    val ink = if (lesson.cancelled) look.p.danger else fach.text
    if (!cell.text) return Box(mod.background(look.of(bg))) {}
    // подпись: «Wie App» — как клетка недели в приложении (Kürzel или Name)
    val small = cell.height < 34
    val label = when {
        small -> lesson.code // в маленькой клетке «Mathe» не влезет — только Kürzel
        s.config.subject == "name" -> lesson.title
        s.config.subject == "kuerzel" -> lesson.code
        else -> if (s.snapshot.plan.lessonLabel == "name") lesson.title else lesson.code
    }
    if (small) {
        // маленькая клетка: Kürzel по центру, без отступов — иначе в узкой клетке текста не останется
        return Box(mod.background(look.of(bg)), contentAlignment = Alignment.Center) {
            Label(label, look.of(ink), cell.fontSize, heavy = true, strike = lesson.cancelled)
        }
    }
    Row(mod.background(look.of(bg)).padding(horizontal = 5.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(GlanceModifier.defaultWeight()) {
            // fillMaxWidth обязателен: без него defaultWeight внутри получает 0 dp и текст пропадает (ошибка 31d)
            Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(GlanceModifier.defaultWeight()) { Label(label, look.of(ink), cell.fontSize, heavy = true, strike = lesson.cancelled) }
                if (cell.teacher && lesson.teacher != null) Label(lesson.teacher, look.of(ink), 9.5f, bold = true)
            }
            if (cell.room && lesson.room != null) Label(lesson.room, look.of(ink), 10, bold = true)
        }
        if (lesson.changed) Dot(look.of(look.p.accent), 6)
    }
}

// ════════════════════ Tests ════════════════════

@Composable
internal fun ColumnScope.Tests(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val today = now.toLocalDate()
    val days = s.config.testsDays
    val exams = data.exams.filter { days == 0 || !it.date.isAfter(today.plusDays(days.toLong())) }
    if (area.oneRow) {
        val first = exams.firstOrNull()
        Header(s, look, t.t("Tests"), R.drawable.w_flag, accent = true, right = if (area.narrow || first == null) null else daysLeft(first.date, today, t))
        if (first == null) { Empty(look, t.t("Keine Tests")); return }
        Label("${first.title} · ${weekday(first.date, t)}", look.of(look.p.ink), 15, heavy = true)
        if (area.narrow) Label(listOfNotNull(daysLeft(first.date, today, t), if (exams.size > 1) t.t("+ {n} weitere", exams.size - 1) else null).joinToString(" · "), look.of(look.p.faint), 11.5f)
        return
    }
    Header(s, look, t.t("Tests"), R.drawable.w_flag, chip = true)
    if (exams.isEmpty()) { Empty(look, t.t("Keine Tests")); Fill(); Footer(s, look); return }
    val fit = fit(exams, freeDp(s, area.height.value), LIST_MODES) { exams.indexOf(it) }
    fit.shown.forEachIndexed { i, exam ->
        if (i > 0) Divider(look)
        val soon = ChronoUnit.DAYS.between(today, exam.date) <= 3
        val date = "${weekday(exam.date, t)} ${exam.date.dayOfMonth}.${exam.date.monthValue}."
        Row(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
            Dot(look.of(Soft.fach(exam.subject, s.snapshot.palette).solid), 8)
            Spacer(GlanceModifier.width(8.dp))
            if (fit.density == Density.NORMAL) {
                Column(GlanceModifier.defaultWeight()) {
                    Label(exam.title, look.of(look.p.ink), 14, heavy = true)
                    Label(if (area.narrow) date else listOf(exam.text.lineSequence().firstOrNull().orEmpty(), date).filter { it.isNotEmpty() }.joinToString(" · "), look.of(look.p.faint), 11.5f)
                }
                Label(daysLeft(exam.date, today, t), look.of(if (soon) look.p.accentInk else look.p.muted), 12, heavy = true)
            } else {
                val name = if (area.narrow && fit.density == Density.DICHT) exam.subject else exam.title
                Box(GlanceModifier.defaultWeight()) { Label(name, look.of(look.p.ink), if (fit.density == Density.DICHT) 12 else 13, bold = true) }
                Label(if (area.narrow) date else "$date · ${daysLeft(exam.date, today, t)}", look.of(if (soon) look.p.accentInk else look.p.faint), 11.5f, bold = soon)
            }
        }
    }
    More(s, look, fit.hidden)
    Fill(); Footer(s, look)
}

// ════════════════════ Aufgaben ════════════════════

@Composable
internal fun ColumnScope.Aufgaben(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val today = now.toLocalDate()
    val open = data.homework.filter { it.id !in s.snapshot.done }
    val list = (if (s.config.showDone) data.homework else open)
        .let { if (s.config.sort == "fach") it.sortedWith(compareBy({ e -> e.title }, { e -> e.date })) else it.sortedBy { e -> e.date } }
    val head = "${t.t("Aufgaben")} · ${open.size} ${t.t("offen")}"
    val first = open.minByOrNull { it.date }
    if (area.oneRow) {
        Header(s, look, if (area.narrow) t.t("Aufgaben") else head, R.drawable.w_list_check, accent = true, right = if (area.narrow) null else first?.let { t.t("bis {n}", daysLeft(it.date, today, t)) })
        if (first == null) { Empty(look, t.t("Alles erledigt")); return }
        Label("${first.title} · ${first.text.lineSequence().first()}", look.of(look.p.ink), if (area.narrow) 13 else 15, heavy = true)
        if (area.narrow) Label(t.t("bis {n}", daysLeft(first.date, today, t)), look.of(look.p.accentInk), 11.5f, bold = true)
        return
    }
    if (area.narrow && area.height < 200.dp) {
        // 2×2: число крупно и самое срочное
        Header(s, look, t.t("Aufgaben"), R.drawable.w_list_check, chip = true)
        if (first == null) { Empty(look, t.t("Alles erledigt")); Fill(); Footer(s, look); return }
        Row(verticalAlignment = Alignment.Bottom) {
            Label("${open.size}", look.of(look.p.ink), 28, heavy = true)
            Spacer(GlanceModifier.width(6.dp))
            Box(GlanceModifier.padding(bottom = 5.dp)) { Label(t.t("offen"), look.of(look.p.muted), 13) }
        }
        Label("${first.title} · ${first.text.lineSequence().first()}", look.of(look.p.ink), 12.5f, bold = true)
        Label(t.t("bis {n}", daysLeft(first.date, today, t)), look.of(look.p.accentInk), 12, bold = true)
        Fill(); More(s, look, open.size - 1); Footer(s, look)
        return
    }
    Header(s, look, head, R.drawable.w_list_check, chip = true)
    if (list.isEmpty()) { Empty(look, t.t("Alles erledigt")); Fill(); Footer(s, look); return }
    // важнее — невыполненные и с близким сроком
    val fit = fit(list, freeDp(s, area.height.value), LIST_MODES) { e -> (if (e.id in s.snapshot.done) 1000 else 0) + ChronoUnit.DAYS.between(today, e.date).toInt().coerceIn(-99, 999) }
    fit.shown.forEachIndexed { i, task ->
        if (i > 0) Divider(look)
        val done = task.id in s.snapshot.done
        val due = t.t("bis {n}", daysLeft(task.date, today, t))
        val soon = !done && ChronoUnit.DAYS.between(today, task.date) <= 1
        val text = task.text.lineSequence().first()
        Row(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
            Image(ImageProvider(if (done) R.drawable.w_ring_check else R.drawable.w_ring), null, GlanceModifier.size(16.dp),
                colorFilter = ColorFilter.tint(look.of(if (done) look.p.ok else look.p.faint)))
            Spacer(GlanceModifier.width(8.dp))
            if (fit.density == Density.NORMAL) {
                Column(GlanceModifier.defaultWeight()) {
                    Label(text, look.of(if (done) look.p.faint else look.p.ink), 13.5f, bold = true, strike = done)
                    Label("${task.title} · $due", look.of(if (soon) look.p.accentInk else look.p.faint), 11.5f, bold = soon)
                }
            } else {
                Box(GlanceModifier.defaultWeight()) { Label(if (area.narrow) "${task.subject} · $text" else text, look.of(if (done) look.p.faint else look.p.ink), if (fit.density == Density.DICHT) 12 else 13, bold = true, strike = done) }
                if (!area.narrow) Label("${task.title} · $due", look.of(if (soon) look.p.accentInk else look.p.faint), 11.5f, bold = soon)
            }
        }
    }
    More(s, look, fit.hidden)
    Fill(); Footer(s, look)
}

// ════════════════════ Änderungen ════════════════════

@Composable
internal fun ColumnScope.Aenderungen(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val today = now.toLocalDate()
    val changes = changesIn(data.days, now, s.config.changes)
    val todayCount = changes.count { it.first.date == today }
    val dayWord = { d: Day -> if (d.date == today) "" else if (d.date == today.plusDays(1)) t.t("morgen") else weekday(d.date, t) }
    val status = { l: Lesson ->
        when {
            l.cancelled -> t.t("fällt aus")
            l.status == "room_change" -> t.t("Raum {n}", l.room ?: "")
            else -> listOf(t.t("Vertretung"), s.place(l, !area.narrow)).filter { it.isNotEmpty() }.joinToString(" · ")
        }
    }
    if (area.oneRow) {
        Header(s, look, if (changes.isEmpty()) t.t("Änderungen") else "${t.t("Änderungen")} · ${changes.size}", R.drawable.w_refresh)
        val (day, first) = changes.firstOrNull() ?: run { Empty(look, t.t("Keine Änderungen")); return }
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Label(first.title, look.of(if (first.cancelled) look.p.danger else look.p.ink), 15, heavy = true, strike = first.cancelled)
            Spacer(GlanceModifier.width(6.dp))
            Box(GlanceModifier.defaultWeight()) { Label(status(first), look.of(if (first.cancelled) look.p.danger else look.p.accentInk), 13, heavy = true) }
            if (!area.narrow) Label(listOf(dayWord(day), t.t("{n}. Stunde", first.period)).filter { it.isNotEmpty() }.joinToString(" · "), look.of(look.p.faint), 12)
        }
        return
    }
    val right = if (area.narrow || changes.isEmpty()) null else "${t.t("heute")} $todayCount · ${t.t("morgen")} ${changes.size - todayCount}"
    Header(s, look, t.t("Änderungen"), R.drawable.w_refresh, right = if (s.config.changes == "morgen") right else null, chip = right == null)
    if (changes.isEmpty()) { Empty(look, t.t("Keine Änderungen")); Fill(); Footer(s, look); return }
    // узко — всегда две строки (статус под предметом), остальное — «+ N weitere»
    val modes = if (area.narrow) listOf(Mode(Density.NORMAL, 42)) else LIST_MODES
    val fit = fit(changes, freeDp(s, area.height.value), modes) { changes.indexOf(it) }
    fit.shown.forEachIndexed { i, (day, lesson) ->
        if (i > 0) Divider(look)
        val color = if (lesson.cancelled) look.p.danger else look.p.accentInk
        Row(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(GlanceModifier.width(18.dp)) { Label("${lesson.period}", look.of(look.p.ink), 13, heavy = true) }
            Dot(look.of(if (lesson.cancelled) look.p.danger else Soft.fach(lesson.subject, s.snapshot.palette).solid), 8)
            Spacer(GlanceModifier.width(7.dp))
            if (fit.density == Density.NORMAL) {
                Column(GlanceModifier.defaultWeight()) {
                    Label(s.title(lesson, area.narrow, Density.NORMAL), look.of(if (lesson.cancelled) look.p.danger else look.p.ink), 14, heavy = true, strike = lesson.cancelled)
                    Label(listOf(status(lesson), dayWord(day)).filter { it.isNotEmpty() }.joinToString(" · "), look.of(color), 11.5f, heavy = true)
                }
            } else {
                Box(GlanceModifier.defaultWeight()) { Label(lesson.title, look.of(if (lesson.cancelled) look.p.danger else look.p.ink), 13, bold = true, strike = lesson.cancelled) }
                val word = dayWord(day)
                if (word.isNotEmpty()) { Label(word, look.of(look.p.faint), 11); Spacer(GlanceModifier.width(8.dp)) }
                Label(status(lesson), look.of(color), 11.5f, heavy = true)
            }
        }
    }
    More(s, look, fit.hidden)
    Fill(); Footer(s, look)
}

// ════════════════════ Termine ════════════════════

@Composable
internal fun ColumnScope.Termine(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val today = now.toLocalDate()
    val days = s.config.termineDays
    val items = data.appointments.filter { days == 0 || !it.from.isAfter(today.plusDays(days.toLong())) }
    val month = { d: LocalDate -> dayLabel(d, t).substringAfter(". ") }
    val sub = { item: Termin ->
        listOfNotNull(weekday(item.from, t), item.time, item.to?.let { t.t("bis {n}", "${it.dayOfMonth}. ${month(it)}") }).joinToString(" · ")
    }
    if (area.oneRow) {
        Header(s, look, t.t("Termine"), R.drawable.w_calendar, right = if (area.narrow) null else items.firstOrNull()?.let { "${weekday(it.from, t)} ${it.from.dayOfMonth}.${it.from.monthValue}." })
        val first = items.firstOrNull() ?: run { Empty(look, t.t("Keine Termine")); return }
        Label(first.title, look.of(look.p.ink), 15, heavy = true)
        if (area.narrow) Label("${first.from.dayOfMonth}.${first.from.monthValue}. · ${sub(first)}", look.of(look.p.faint), 11.5f)
        return
    }
    Header(s, look, t.t("Termine"), R.drawable.w_calendar, chip = true)
    if (items.isEmpty()) { Empty(look, t.t("Keine Termine")); Fill(); Footer(s, look); return }
    val modes = if (area.narrow) listOf(Mode(Density.NORMAL, 50), Mode(Density.ZWEI, 40)) else listOf(Mode(Density.NORMAL, 50), Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 21))
    val fit = fit(items, freeDp(s, area.height.value), modes) { items.indexOf(it) }
    fit.shown.forEachIndexed { i, item ->
        if (i > 0) Divider(look)
        Row(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
            when (fit.density) {
                Density.NORMAL -> {
                    // плитка даты: «23 / SEP»
                    Box(GlanceModifier.width(36.dp).height((fit.rowDp - 12).dp).cornerRadius(look.cellRadius.dp).background(look.of(look.p.tint)), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Label("${item.from.dayOfMonth}", look.of(look.p.accentInk), 14, heavy = true)
                            Label(month(item.from).take(3).uppercase(), look.of(look.p.accentInk), 8, heavy = true)
                        }
                    }
                    Spacer(GlanceModifier.width(10.dp))
                    Column(GlanceModifier.defaultWeight()) {
                        Label(item.title, look.of(look.p.ink), 13.5f, heavy = true)
                        Label(sub(item), look.of(look.p.faint), 11.5f)
                    }
                }
                Density.ZWEI -> Column(GlanceModifier.defaultWeight()) {
                    Label(item.title, look.of(look.p.ink), 13, bold = true)
                    Label("${item.from.dayOfMonth}. ${month(item.from)} · ${sub(item)}", look.of(look.p.faint), 11.5f)
                }
                else -> {
                    Box(GlanceModifier.defaultWeight()) { Label(item.title, look.of(look.p.ink), if (fit.density == Density.DICHT) 12 else 13, bold = true) }
                    Label("${item.from.dayOfMonth}. ${month(item.from)}", look.of(look.p.faint), 11.5f)
                }
            }
        }
    }
    More(s, look, fit.hidden)
    Fill(); Footer(s, look)
}

// ════════════════════ Notizen ════════════════════

@Composable
internal fun ColumnScope.Notizen(s: WidgetState, look: Look) {
    val t = s.texts
    val area = area()
    val notes = s.snapshot.classes.firstOrNull { it.id == s.config.classId }?.notes.orEmpty()
        .map { it.lineSequence().map(String::trim).filter(String::isNotEmpty).joinToString(" ") }
    if (area.oneRow) {
        Header(s, look, t.t("Notizen"), R.drawable.w_file)
        val first = notes.firstOrNull() ?: run { Label(t.t("Keine Notizen"), look.of(look.p.faint), 13); return }
        // узко: одна заметка в две строки, а не «Vokabeln Unit 3 le…»
        Label(first, look.of(look.p.ink), if (area.narrow) 13.5f else 15, heavy = true, lines = if (area.narrow) 2 else 1)
        return
    }
    Header(s, look, t.t("Notizen"), R.drawable.w_file, chip = true)
    if (notes.isEmpty()) { Label(t.t("Keine Notizen"), look.of(look.p.faint), 13); Fill(); return }
    val modes = if (area.narrow) listOf(Mode(Density.ZWEI, 44)) else listOf(Mode(Density.NORMAL, 52), Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 21))
    val fit = fit(notes, freeDp(s, area.height.value), modes) { notes.indexOf(it) }
    fit.shown.forEachIndexed { i, note ->
        if (i > 0) Divider(look)
        val two = fit.density == Density.NORMAL || fit.density == Density.ZWEI
        Box(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), contentAlignment = Alignment.CenterStart) {
            Label(note, look.of(look.p.ink), if (fit.density == Density.DICHT) 12 else 13.5f, bold = true, lines = if (two) 2 else 1)
        }
    }
    More(s, look, fit.hidden)
    Fill()
}

// ════════════════════ Countdown ════════════════════

@Composable
internal fun ColumnScope.CountdownView(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val area = area()
    val c = data.countdown
    val today = now.toLocalDate()
    if (c == null) {
        Header(s, look, t.t("Countdown"), R.drawable.w_sun)
        Label(t.t("Keine Ferien eingetragen"), look.of(look.p.faint), 13); Fill(); return
    }
    // «Zählen»: Schultage (считает сервер) или просто дни по календарю
    val calendar = s.config.count == "tage"
    val n = if (calendar) ChronoUnit.DAYS.between(today, c.from).toInt().coerceAtLeast(0) else c.days ?: 0
    val unit = t.t(if (calendar) (if (n == 1) "Tag" else "Tage") else (if (n == 1) "Schultag" else "Schultage"))
    val from = "${c.from.dayOfMonth}. ${dayLabel(c.from, t).substringAfter(". ")}"
    if (c.running) {
        Header(s, look, t.t("Countdown"), R.drawable.w_sun)
        Label(c.title, look.of(look.p.ink), 18, heavy = true); Empty(look, t.t("Gerade frei")); Fill(); return
    }
    if (area.oneRow) {
        if (area.narrow) {
            Row(verticalAlignment = Alignment.Bottom) {
                Label("$n", look.of(look.p.ink), 26, heavy = true)
                Spacer(GlanceModifier.width(5.dp))
                Box(GlanceModifier.padding(bottom = 4.dp)) { Label(unit, look.of(look.p.muted), 12.5f, bold = true) }
            }
            Label(t.t("bis {n}", c.title), look.of(look.p.faint), 11.5f)
        } else {
            Header(s, look, t.t("Countdown"), R.drawable.w_sun, right = from)
            Label("$n $unit · ${t.t("bis {n}", c.title)}", look.of(look.p.ink), 15, heavy = true)
        }
        Fill(); c.progress?.let { Bar(look, it) }
        return
    }
    Header(s, look, t.t("Countdown"), R.drawable.w_sun, right = if (area.narrow) null else from)
    Fill()
    Row(verticalAlignment = Alignment.Bottom) {
        Label("$n", look.of(look.p.ink), 30, heavy = true)
        Spacer(GlanceModifier.width(6.dp))
        Box(GlanceModifier.padding(bottom = 5.dp)) { Label(unit, look.of(look.p.muted), 13) }
    }
    Label(t.t("bis {n}", c.title), look.of(look.p.ink), 12.5f, bold = true)
    c.progress?.let { Spacer(GlanceModifier.height(8.dp)); Bar(look, it) }
    // большой: что ещё до каникул — тесты и термины, по дате
    val free = freeDp(s, area.height.value) - 96f
    if (!area.narrow && free >= 28f) {
        val before = (data.exams.filter { it.date.isBefore(c.from) }.map { it.date to it.title } +
            data.appointments.filter { it.from.isBefore(c.from) && !it.from.isBefore(today) }.map { it.from to it.title }).sortedBy { it.first }
        if (before.isNotEmpty()) {
            Spacer(GlanceModifier.height(8.dp)); Divider(look)
            val fit = fit(before, free - 10f, listOf(Mode(Density.KOMPAKT, 28), Mode(Density.DICHT, 21))) { before.indexOf(it) }
            fit.shown.forEach { (date, title) ->
                Row(GlanceModifier.fillMaxWidth().height(fit.rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(GlanceModifier.defaultWeight()) { Label(title, look.of(look.p.ink), 13, bold = true) }
                    Label("${weekday(date, t)} ${date.dayOfMonth}.${date.monthValue}.", look.of(look.p.faint), 12)
                }
            }
            More(s, look, fit.hidden)
        }
    }
    Fill(); Footer(s, look)
}
