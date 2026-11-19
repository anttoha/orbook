package net.orbitium.orbook.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.ColorFilter
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ColumnScope
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextDecoration
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import net.orbitium.orbook.MainActivity
import net.orbitium.orbook.R
import net.orbitium.orbook.Site
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.time.temporal.IsoFields
import java.util.Locale

/**
 * Виджет ORBook: те же блоки, что на «Start» сайта (Jetzt, Heute, Woche, Tests …), любой размер.
 * Данные — последний ответ /api/widget (WidgetSync) и снимок сайта (заметки, галочки, тексты).
 */
class OrbWidget : GlanceAppWidget() {
    // Exact: виджет знает свой настоящий размер и сам решает, сколько строк поместится
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val appWidgetId = GlanceAppWidgetManager(context).getAppWidgetId(id)
        val store = WidgetStore(context)
        val config = store.config(appWidgetId) ?: WidgetConfig()
        val snapshot = store.snapshot()
        val key = WidgetStore.key(config.classId, config.mine)
        val json = store.data(key)
        val state = WidgetState(
            config = config,
            snapshot = snapshot,
            data = json?.let { runCatching { parseWidgetData(it) }.getOrNull() },
            status = store.state(key),
            fetchedAt = store.fetchedAt(key),
            className = snapshot.classes.firstOrNull { it.id == config.classId }?.name,
        )
        provideContent { WidgetContent(context, state) }
    }
}

/** Всё, что нужно нарисовать один виджет. */
class WidgetState(
    val config: WidgetConfig,
    val snapshot: Snapshot,
    val data: WidgetData?,
    val status: String,
    val fetchedAt: Long,
    val className: String?,
) {
    val texts get() = snapshot.texts
    val look: Look
        get() {
            val dark = when (config.look) {
                "hell" -> false
                "dunkel" -> true
                else -> snapshot.theme?.let { it == "dark" }
            }
            return Look(dark, config.background == "halb")
        }

    /** Данные старше 45 минут — сети не было: внизу «Stand Mi 07:12». */
    val offline get() = fetchedAt > 0 && System.currentTimeMillis() - fetchedAt > 45 * 60_000
}

private val PATHS = mapOf(
    "jetzt" to "/heute", "heute" to "/heute", "aenderungen" to "/heute", "woche" to "/woche",
    "tests" to "/testen", "aufgaben" to "/testen", "termine" to "/testen", "countdown" to "/testen", "notizen" to "/start",
)

private fun openApp(context: Context, path: String) =
    Intent(context, MainActivity::class.java).setData(Uri.parse(Site.url(path))).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

@Composable
private fun WidgetContent(context: Context, s: WidgetState) {
    val look = s.look
    val path = if (s.status == "ok") PATHS[s.config.kind] ?: "/" else "/"
    Column(
        GlanceModifier.fillMaxSize().cornerRadius(22.dp).background(look.background).padding(14.dp)
            .clickable(actionStartActivity(openApp(context, path))),
    ) {
        val data = s.data
        when {
            s.status == "auth" -> Locked(s, look)
            s.status == "ended" -> Ended(s, look)
            data == null -> Loading(look)
            else -> Kind(s, data, look)
        }
    }
}

// ── общие кусочки: шапка, строки, текст ──

@Composable
private fun Label(value: String, color: ColorProvider, size: Int, bold: Boolean = false, strike: Boolean = false, heavy: Boolean = false) =
    Text(
        value,
        maxLines = 1,
        style = TextStyle(
            color = color,
            fontSize = size.sp,
            fontWeight = if (bold || heavy) FontWeight.Bold else FontWeight.Normal,
            textDecoration = if (strike) TextDecoration.LineThrough else null,
        ),
    )

@Composable
private fun Header(s: WidgetState, look: Look, title: String, icon: Int, accent: Boolean = false, right: String? = null, chip: Boolean = false) {
    val color = look.of(if (accent) Soft.accentInk else Soft.faint)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Image(ImageProvider(icon), null, GlanceModifier.size(14.dp), colorFilter = ColorFilter.tint(color))
        Spacer(GlanceModifier.width(6.dp))
        Box(GlanceModifier.defaultWeight()) { Label(title.uppercase(Locale.GERMAN), color, 11, bold = true) }
        val wide = LocalSize.current.width >= 250.dp
        if (right != null) Label(right, look.of(Soft.ink), 12, bold = true)
        // у широких виджетов — чип класса справа сверху (у узких места нет)
        val name = s.data?.className?.ifEmpty { null } ?: s.className
        if (chip && wide && right == null && name != null) {
            Box(GlanceModifier.cornerRadius(10.dp).background(look.of(Soft.tint)).padding(horizontal = 8.dp, vertical = 2.dp)) {
                Label(name, look.of(Soft.accentInk), 11, heavy = true)
            }
        }
    }
    Spacer(GlanceModifier.height(10.dp))
}

@Composable
private fun Dot(color: ColorProvider, size: Int = 8) =
    Image(ImageProvider(R.drawable.w_dot), null, GlanceModifier.size(size.dp), colorFilter = ColorFilter.tint(color))

@Composable
private fun Divider(look: Look) = Box(GlanceModifier.fillMaxWidth().height(1.dp).background(look.of(Soft.hair))) {}

@Composable
private fun ColumnScope.Fill() = Spacer(GlanceModifier.defaultWeight())

@Composable
private fun Footer(s: WidgetState, look: Look) {
    if (!s.offline) return
    val time = LocalDateTime.ofInstant(Instant.ofEpochMilli(s.fetchedAt), ZoneId.systemDefault())
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(ImageProvider(R.drawable.w_wifi_off), null, GlanceModifier.size(13.dp), colorFilter = ColorFilter.tint(look.of(Soft.faint)))
        Spacer(GlanceModifier.width(5.dp))
        Label(s.texts.t("Stand {n}", "${weekday(time.toLocalDate(), s.texts)} ${HHMM.format(time)}"), look.of(Soft.faint), 12, bold = true)
    }
}

@Composable
private fun Empty(look: Look, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Dot(look.of(Soft.ok), 7)
        Spacer(GlanceModifier.width(6.dp))
        Label(value, look.of(Soft.ok), 12, bold = true)
    }
}

private val HHMM = DateTimeFormatter.ofPattern("HH:mm")

private fun locale(texts: Texts) = Locale.forLanguageTag(texts.lang)

/** «Mo», «Di» … — без точки, как на сайте. */
private fun weekday(date: LocalDate, texts: Texts) =
    date.format(DateTimeFormatter.ofPattern("EEE", locale(texts))).trimEnd('.').replaceFirstChar { it.uppercase() }

/** «Mo, 22. Sept» */
private fun dayLabel(date: LocalDate, texts: Texts) =
    "${weekday(date, texts)}, ${date.dayOfMonth}. ${date.format(DateTimeFormatter.ofPattern("MMM", locale(texts))).trimEnd('.')}"

/** «heute», «morgen», «in 3 Tagen» */
private fun daysLeft(date: LocalDate, today: LocalDate, texts: Texts): String = when (val n = ChronoUnit.DAYS.between(today, date)) {
    0L -> texts.t("heute")
    1L -> texts.t("morgen")
    else -> texts.t("in {n} Tagen", n)
}

// ── виды ──

@Composable
private fun ColumnScope.Kind(s: WidgetState, data: WidgetData, look: Look) {
    // Время школы: «now» из ответа плюс сколько прошло с загрузки (у демо своя дата, телефон её не знает)
    val elapsed = Duration.ofMillis((System.currentTimeMillis() - s.fetchedAt).coerceAtLeast(0))
    val now = data.now?.plus(elapsed) ?: LocalDateTime.now()
    when (s.config.kind) {
        "heute" -> Heute(s, data, look, now)
        "woche" -> Woche(s, data, look, now)
        "tests" -> Tests(s, data, look, now)
        "aufgaben" -> Aufgaben(s, data, look, now)
        "aenderungen" -> Aenderungen(s, data, look, now)
        "termine" -> Termine(s, data, look, now)
        "notizen" -> Notizen(s, look)
        "countdown" -> CountdownView(s, data, look)
        else -> Jetzt(s, data, look, now)
    }
}

@Composable
private fun ColumnScope.Jetzt(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val current = nowOf(data.days, now)
    if (current == null) return NextDay(s, data, look, now)
    val lesson = current.lesson
    val start = lesson.start!!
    val end = lesson.end!!
    val wide = LocalSize.current.width >= 250.dp
    val head = if (current.running) t.t("Jetzt") else t.t("Gleich")
    val minutes = Duration.between(now.toLocalTime(), if (current.running) end else start).toMinutes() + 1
    val right = if (current.running) t.t("noch {n} min", minutes) else t.t("in {n} min", minutes)
    Header(s, look, if (wide) "$head · ${t.t("{n}. Stunde", lesson.period)}" else head, R.drawable.w_clock, accent = true, right = if (wide) right else null)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(GlanceModifier.defaultWeight()) { Label(lesson.title, look.of(Soft.ink), if (wide) 22 else 18, heavy = true) }
        if (wide) Label("${HHMM.format(start)}–${HHMM.format(end)}", look.of(Soft.faint), 12)
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
        if (lesson.changed) Label(t.t("Vertretung") + " · ", look.of(Soft.accentInk), 13, bold = true)
        Label(listOfNotNull(lesson.teacher, lesson.room?.let { t.t("Raum {n}", it) }).joinToString(" · "), look.of(Soft.muted), 13)
    }
    if (!wide) {
        Label(if (current.running) right else HHMM.format(start), look.of(Soft.accentInk), 12, bold = true)
        Fill(); Footer(s, look); return
    }
    Fill()
    if (current.running) {
        val total = Duration.between(start, end).toMinutes().coerceAtLeast(1)
        val done = Duration.between(start, now.toLocalTime()).toMinutes()
        LinearProgressIndicator(done.toFloat() / total, GlanceModifier.fillMaxWidth().height(6.dp), look.of(Soft.accent), look.of(Soft.sand))
        Spacer(GlanceModifier.height(8.dp))
    }
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        val cancelled = current.nextCancelled
        Row(GlanceModifier.defaultWeight(), verticalAlignment = Alignment.CenterVertically) {
            if (cancelled != null) {
                Dot(look.of(Soft.danger), 7); Spacer(GlanceModifier.width(6.dp))
                Label("${cancelled.start?.let(HHMM::format)} · ", look.of(Soft.danger), 12, bold = true)
                Label(cancelled.title, look.of(Soft.danger), 12, bold = true, strike = true)
                Label(" " + t.t("fällt aus"), look.of(Soft.danger), 12, bold = true)
            }
        }
        current.after?.let { Label(t.t("dann {n}", "${it.title} · ${it.start?.let(HHMM::format)}"), look.of(Soft.faint), 12) }
    }
    Footer(s, look)
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
    Header(s, look, title, R.drawable.w_sun, accent = true, right = day?.let { dayLabel(it.date, t) })
    val first = day?.lessons?.filter { !it.cancelled }?.minByOrNull { it.period }
    if (first == null) return Empty(look, t.t("Kein Unterricht"))
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(GlanceModifier.defaultWeight()) { Label(first.title, look.of(Soft.ink), 22, heavy = true) }
        if (first.start != null && first.end != null) Label("${HHMM.format(first.start)}–${HHMM.format(first.end)}", look.of(Soft.faint), 12)
    }
    Label(listOfNotNull(t.t("{n}. Stunde", first.period), first.teacher, first.room?.let { t.t("Raum {n}", it) }).joinToString(" · "), look.of(Soft.muted), 12)
    Fill()
    val changes = day.lessons.count { it.cancelled || it.changed }
    if (changes == 0) Empty(look, t.t("Keine Änderungen"))
    else Label(t.t("{n} Änderungen", changes), look.of(Soft.accentInk), 12, bold = true)
    Footer(s, look)
}

@Composable
private fun ColumnScope.Heute(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val day = dayToShow(data.days, now)
    val lessons = day?.lessons.orEmpty()
    val name = when {
        day == null || day.date == now.toLocalDate() -> t.t("Heute")
        day.date == now.toLocalDate().plusDays(1) -> t.t("Morgen")
        else -> weekday(day.date, t)
    }
    val count = lessons.count { !it.cancelled }
    Header(s, look, if (count > 0) "$name · ${t.t(if (count == 1) "{n} Stunde" else "{n} Stunden", count)}" else name, R.drawable.w_list, chip = true)
    if (lessons.isEmpty()) { Empty(look, t.t("Kein Unterricht")); Fill(); Footer(s, look); return }
    val size = LocalSize.current
    val wide = size.width >= 250.dp
    val rows = ((size.height.value - 60 - if (s.offline) 20 else 0) / 32).toInt().coerceAtLeast(1)
    val time = now.toLocalTime()
    val today = day?.date == now.toLocalDate()
    val from = if (today) lessons.indexOfFirst { it.end == null || it.end > time }.coerceAtLeast(0) else 0
    val shown = lessons.drop(if (lessons.size - from >= rows) from else (lessons.size - rows).coerceAtLeast(0)).take(rows)
    shown.forEachIndexed { i, lesson ->
        if (i > 0) Divider(look)
        val running = today && lesson.start != null && lesson.end != null && time >= lesson.start && time < lesson.end
        val rowMod = GlanceModifier.fillMaxWidth().height(31.dp).padding(horizontal = 6.dp)
        Row((if (running) rowMod.cornerRadius(10.dp).background(look.of(Soft.tint)) else rowMod), verticalAlignment = Alignment.CenterVertically) {
            Box(GlanceModifier.width(16.dp)) { Label("${lesson.period}", look.of(Soft.ink), 13, heavy = true) }
            if (wide) Box(GlanceModifier.width(44.dp)) { Label(lesson.start?.let(HHMM::format) ?: "", look.of(Soft.faint), 12) }
            Dot(if (lesson.cancelled) look.of(Soft.danger) else look.of(Soft.fach(lesson.subject, s.snapshot.palette).solid))
            Spacer(GlanceModifier.width(8.dp))
            Box(GlanceModifier.defaultWeight()) {
                Label(lesson.title, look.of(if (lesson.cancelled) Soft.danger else Soft.ink), 13, bold = true, strike = lesson.cancelled)
            }
            when {
                lesson.cancelled -> Label(t.t("fällt aus"), look.of(Soft.danger), 12, heavy = true)
                lesson.status in setOf("substitution", "moved", "added") ->
                    Label(if (wide) listOf(t.t("Vertretung"), lesson.place).filter { it.isNotEmpty() }.joinToString(" · ") else t.t("Vertretung"), look.of(Soft.accentInk), 12, bold = true)
                wide -> Label(lesson.place, look.of(Soft.faint), 12)
            }
        }
    }
    Fill(); Footer(s, look)
}

@Composable
private fun ColumnScope.Woche(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    val days = weekToShow(data.days, now)
    val week = days.firstOrNull()?.date?.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
    Header(s, look, if (week != null) "${t.t("Woche")} · ${t.t("KW")} $week" else t.t("Woche"), R.drawable.w_week, chip = true)
    val periods = days.flatMap { d -> d.lessons.map { it.period } }.distinct().sorted()
    // Показываем ВСЕ уроки недели: высота ячейки подбирается под виджет, а не наоборот
    val size = LocalSize.current
    val free = size.height.value - 70 - if (s.offline) 20 else 0
    val gap = if (periods.size > 6) 2 else 4
    val cell = WeekCellSize.of(free, periods.size, gap)
    // шапка дней: сегодняшний — цветом акцента
    Row(GlanceModifier.fillMaxWidth()) {
        days.forEach { d ->
            Box(GlanceModifier.defaultWeight().padding(bottom = 4.dp), contentAlignment = Alignment.Center) {
                Label(weekday(d.date, t).uppercase(), look.of(if (d.date == now.toLocalDate()) Soft.accent else Soft.faint), 11, heavy = true)
            }
        }
    }
    periods.forEach { period ->
        Row(GlanceModifier.fillMaxWidth().padding(bottom = gap.dp)) {
            days.forEach { d ->
                val lesson = d.lessons.firstOrNull { it.period == period && !it.cancelled } ?: d.lessons.firstOrNull { it.period == period }
                Box(GlanceModifier.defaultWeight().padding(horizontal = 2.dp)) { WeekCell(s, look, lesson, cell) }
            }
        }
    }
    Fill(); Footer(s, look)
}

/** Размер ячейки недели: чем больше уроков, тем меньше ячейка и тем меньше в ней написано. */
private class WeekCellSize(val height: Int, val room: Boolean, val fontSize: Int, val text: Boolean) {
    companion object {
        fun of(free: Float, periods: Int, gap: Int): WeekCellSize {
            val h = (free / periods.coerceAtLeast(1)).toInt() - gap
            return when {
                h >= 34 -> WeekCellSize(minOf(h, 40), room = true, fontSize = 12, text = true)
                h >= 20 -> WeekCellSize(h, room = false, fontSize = 12, text = true)
                h >= 14 -> WeekCellSize(h, room = false, fontSize = 10, text = true)
                else -> WeekCellSize(h.coerceAtLeast(6), room = false, fontSize = 10, text = false) // только цвет
            }
        }
    }
}

@Composable
private fun WeekCell(s: WidgetState, look: Look, lesson: Lesson?, cell: WeekCellSize) {
    val mod = GlanceModifier.fillMaxWidth().height(cell.height.dp).cornerRadius(if (cell.height < 20) 6.dp else 10.dp)
    if (lesson == null) return Box(mod.background(look.of(Soft.sand))) {}
    val fach = Soft.fach(lesson.subject, s.snapshot.palette)
    val bg = if (lesson.cancelled) Soft.dangerTint else fach.tint
    val ink = if (lesson.cancelled) Soft.danger else fach.text
    if (!cell.text) return Box(mod.background(look.of(bg))) {}
    Row(mod.background(look.of(bg)).padding(horizontal = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(GlanceModifier.defaultWeight()) {
            Label(lesson.code, look.of(ink), cell.fontSize, heavy = true, strike = lesson.cancelled)
            if (cell.room && lesson.room != null) Label(lesson.room, look.of(ink), 11)
        }
        if (lesson.changed) Dot(look.of(Soft.accent), 6)
    }
}

@Composable
private fun ColumnScope.Tests(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    Header(s, look, t.t("Tests"), R.drawable.w_flag, chip = true)
    if (data.exams.isEmpty()) { Empty(look, t.t("Keine Tests")); Fill(); Footer(s, look); return }
    val count = ((LocalSize.current.height.value - 50) / 44).toInt().coerceIn(1, data.exams.size)
    data.exams.take(count).forEachIndexed { i, exam ->
        if (i > 0) { Spacer(GlanceModifier.height(6.dp)); Divider(look); Spacer(GlanceModifier.height(6.dp)) }
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Dot(look.of(Soft.fach(exam.subject, s.snapshot.palette).solid))
            Spacer(GlanceModifier.width(8.dp))
            Box(GlanceModifier.defaultWeight()) { Label(exam.title, look.of(Soft.ink), if (i == 0) 15 else 13, heavy = i == 0, bold = true) }
            if (i > 0) Label("${weekday(exam.date, t)} ${exam.date.dayOfMonth}.${exam.date.monthValue}.", look.of(Soft.faint), 12)
        }
        if (i == 0) Label("${weekday(exam.date, t)} · ${daysLeft(exam.date, now.toLocalDate(), t)} · ${exam.text}", look.of(Soft.accentInk), 12, bold = true)
    }
    Fill(); Footer(s, look)
}

@Composable
private fun ColumnScope.Aufgaben(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    Header(s, look, t.t("Aufgaben"), R.drawable.w_list_check, chip = true)
    val open = data.homework.filter { it.id !in s.snapshot.done }
    if (open.isEmpty()) { Empty(look, t.t("Alles erledigt")); Fill(); Footer(s, look); return }
    Fill()
    Row(verticalAlignment = Alignment.Bottom) {
        Label("${open.size}", look.of(Soft.ink), 30, heavy = true)
        Spacer(GlanceModifier.width(6.dp))
        Box(GlanceModifier.padding(bottom = 5.dp)) { Label(t.t("offen"), look.of(Soft.muted), 13) }
    }
    val first = open.first()
    Label("${first.title} · ${first.text.lineSequence().first()}", look.of(Soft.ink), 12, bold = true)
    Label(t.t("bis {n}", daysLeft(first.date, now.toLocalDate(), t)), look.of(Soft.accentInk), 12, bold = true)
    Footer(s, look)
}

@Composable
private fun ColumnScope.Aenderungen(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    Header(s, look, t.t("Änderungen"), R.drawable.w_refresh, chip = true)
    val changes = changesSoon(data.days, now)
    if (changes.isEmpty()) { Empty(look, t.t("Keine Änderungen")); Fill(); Footer(s, look); return }
    Fill()
    val count = ((LocalSize.current.height.value - 50) / 40).toInt().coerceIn(1, changes.size)
    changes.take(count).forEach { (day, lesson) ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (lesson.cancelled) {
                Label(lesson.title, look.of(Soft.danger), 14, heavy = true, strike = true)
                Label(" " + t.t("fällt aus"), look.of(Soft.danger), 14, heavy = true)
            } else {
                Label(lesson.title + " " + t.t(if (lesson.status == "room_change") "Raumwechsel" else "vertreten"), look.of(Soft.accentInk), 14, heavy = true)
            }
        }
        val whenText = if (day.date == now.toLocalDate()) "" else "${weekday(day.date, t)} · "
        Label(whenText + listOf(t.t("{n}. Stunde", lesson.period), if (lesson.cancelled) "" else lesson.place).filter { it.isNotEmpty() }.joinToString(" · "), look.of(Soft.faint), 12)
        Spacer(GlanceModifier.height(6.dp))
    }
    Footer(s, look)
}

@Composable
private fun ColumnScope.Termine(s: WidgetState, data: WidgetData, look: Look, now: LocalDateTime) {
    val t = s.texts
    Header(s, look, t.t("Termine"), R.drawable.w_calendar, chip = true)
    if (data.appointments.isEmpty()) { Empty(look, t.t("Keine Termine")); Fill(); Footer(s, look); return }
    val count = ((LocalSize.current.height.value - 50) / 42).toInt().coerceIn(1, data.appointments.size)
    data.appointments.take(count).forEachIndexed { i, item ->
        if (i > 0) { Spacer(GlanceModifier.height(5.dp)); Divider(look); Spacer(GlanceModifier.height(5.dp)) }
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Dot(look.of(if (item.kind == "free") Soft.ok else Soft.accent))
            Spacer(GlanceModifier.width(8.dp))
            Box(GlanceModifier.defaultWeight()) { Label(item.title, look.of(Soft.ink), 13, bold = true) }
            Label(daysLeft(item.from.coerceAtLeast(now.toLocalDate()), now.toLocalDate(), t), look.of(Soft.faint), 12)
        }
        Label(listOfNotNull(dayLabel(item.from, t), item.to?.let { dayLabel(it, t) }).joinToString(" – ") + (item.time?.let { " · $it" } ?: ""), look.of(Soft.faint), 12)
    }
    Fill(); Footer(s, look)
}

@Composable
private fun ColumnScope.Notizen(s: WidgetState, look: Look) {
    val t = s.texts
    Header(s, look, t.t("Notizen"), R.drawable.w_file, chip = true)
    val notes = s.snapshot.classes.firstOrNull { it.id == s.config.classId }?.notes.orEmpty()
    if (notes.isEmpty()) { Label(t.t("Keine Notizen"), look.of(Soft.faint), 13); Fill(); return }
    val count = ((LocalSize.current.height.value - 50) / 30).toInt().coerceIn(1, notes.size)
    notes.take(count).forEachIndexed { i, note ->
        if (i > 0) { Spacer(GlanceModifier.height(5.dp)); Divider(look); Spacer(GlanceModifier.height(5.dp)) }
        Label(note.lineSequence().first(), look.of(Soft.ink), 13, bold = i == 0)
    }
    Fill()
}

@Composable
private fun ColumnScope.CountdownView(s: WidgetState, data: WidgetData, look: Look) {
    val t = s.texts
    Header(s, look, t.t("Countdown"), R.drawable.w_sun)
    val c = data.countdown
    if (c == null) { Label(t.t("Keine Ferien eingetragen"), look.of(Soft.faint), 13); Fill(); return }
    Fill()
    if (c.running) {
        Label(c.title, look.of(Soft.ink), 20, heavy = true)
        Empty(look, t.t("Gerade frei"))
    } else {
        Row(verticalAlignment = Alignment.Bottom) {
            Label("${c.days ?: 0}", look.of(Soft.ink), 30, heavy = true)
            Spacer(GlanceModifier.width(6.dp))
            Box(GlanceModifier.padding(bottom = 5.dp)) { Label(t.t(if (c.days == 1) "Schultag" else "Schultage"), look.of(Soft.muted), 13) }
        }
        Label(t.t("bis {n}", c.title), look.of(Soft.ink), 12, bold = true)
        c.progress?.let {
            Spacer(GlanceModifier.height(8.dp))
            LinearProgressIndicator(it, GlanceModifier.fillMaxWidth().height(6.dp), look.of(Soft.accent), look.of(Soft.sand))
        }
    }
    Footer(s, look)
}

// ── состояния без данных ──

@Composable
private fun ColumnScope.Locked(s: WidgetState, look: Look) {
    val t = s.texts
    Header(s, look, "ORBook", R.drawable.w_lock)
    Fill()
    Label(t.t("Nicht angemeldet"), look.of(Soft.ink), 16, heavy = true)
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.fillMaxWidth().height(36.dp).cornerRadius(18.dp).background(look.of(Soft.accent)), contentAlignment = Alignment.Center) {
        Label(t.t("Öffnen"), look.of(Soft.onAccent), 13, heavy = true)
    }
}

@Composable
private fun ColumnScope.Ended(s: WidgetState, look: Look) {
    val t = s.texts
    Header(s, look, s.className?.let { t.t("Klasse {n}", it) } ?: "ORBook", R.drawable.w_warn)
    Fill()
    Label(t.t("Zugang beendet"), look.of(Soft.danger), 16, heavy = true)
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.fillMaxWidth().height(36.dp).cornerRadius(18.dp).background(look.of(Soft.sand)), contentAlignment = Alignment.Center) {
        Label(t.t("Neuer Code"), look.of(Soft.ink), 13, heavy = true)
    }
}

/** Только что положили на рабочий стол — данные ещё грузятся: серые полоски, как скелет на сайте. */
@Composable
private fun ColumnScope.Loading(look: Look) {
    val bar = look.of(Soft.skeleton)
    Box(GlanceModifier.width(90.dp).height(10.dp).cornerRadius(5.dp).background(bar)) {}
    Spacer(GlanceModifier.height(18.dp))
    Box(GlanceModifier.width(150.dp).height(20.dp).cornerRadius(10.dp).background(bar)) {}
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.width(200.dp).height(10.dp).cornerRadius(5.dp).background(bar)) {}
    Fill()
    Box(GlanceModifier.fillMaxWidth().height(6.dp).cornerRadius(3.dp).background(bar)) {}
}
