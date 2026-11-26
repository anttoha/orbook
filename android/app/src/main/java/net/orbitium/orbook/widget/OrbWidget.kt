package net.orbitium.orbook.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
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
import net.orbitium.orbook.noten.NotenStore
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale

/**
 * Виджет ORBook: те же блоки, что на «Start» сайта (Jetzt, Heute, Woche, Tests …), любой размер.
 * Данные — последний ответ /api/widget (WidgetSync) и снимок сайта (заметки, галочки, тексты, оформление).
 * Часть 31d: что показать при нехватке места — правило из WidgetLayout.kt; виды — WidgetKinds.kt.
 */
class OrbWidget : GlanceAppWidget() {
    // Exact: виджет знает свой настоящий размер и сам решает, сколько строк поместится
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val appWidgetId = GlanceAppWidgetManager(context).getAppWidgetId(id)
        val store = WidgetStore(context)
        val config = store.config(appWidgetId) ?: WidgetConfig()
        val snapshot = store.snapshot()
        val mine = config.mineWith(snapshot)
        val key = WidgetStore.key(config.classId, mine)
        // часть 31e: своего ответа ещё нет (только что положили, а сети нет) — берём тот же класс с другим «Nur meine Kurse»
        val json = store.data(key) ?: store.data(WidgetStore.key(config.classId, !mine))
        val state = WidgetState(
            config = config,
            snapshot = snapshot,
            data = json?.let { runCatching { parseWidgetData(it) }.getOrNull() },
            status = store.state(key),
            fetchedAt = store.fetchedAt(key),
            className = snapshot.classes.firstOrNull { it.id == config.classId }?.name,
            noten = if (config.noten) notenOf(context) else null,
        )
        provideContent { WidgetContent(context, state) }
    }
}

/** Часть 39: сохранённые приложением оценки (расшифровать не вышло или их нет — null, «In ORBook bei Noten anmelden»). */
private fun notenOf(context: Context): NotenView? {
    val store = NotenStore(context)
    val json = store.data() ?: return null
    return runCatching { notenView(json, store.fresh()) }.getOrNull()
}

/** Всё, что нужно нарисовать один виджет. */
class WidgetState(
    val config: WidgetConfig,
    val snapshot: Snapshot,
    val data: WidgetData?,
    val status: String,
    val fetchedAt: Long,
    val className: String?,
    val noten: NotenView? = null, // часть 39: только у видов Noten, Neue Noten, Fehlzeiten
) {
    val texts get() = snapshot.texts
    val look: Look
        get() {
            val dark = when (config.look) {
                "hell" -> false
                "dunkel" -> true
                else -> snapshot.theme?.let { it == "dark" }
            }
            // «Wie App» — оформление и акцент приложения из снимка
            val design = if (config.design == "app") snapshot.design else config.design
            val accent = if (config.accent == "app") snapshot.accent else config.accent
            val scale = when (config.font) { "s" -> 0.9f; "l" -> 1.12f; else -> 1f }
            return Look(dark, Soft.palette(design, accent), design, config.alpha / 100f, scale)
        }

    /** «Ausfall»: прятать отменённые уроки — своя настройка или «Stundenplan» приложения. */
    val hideCancelled get() = config.cancelled == "ausblenden" || (config.cancelled == "app" && snapshot.plan.hideCancelled)

    /** Подпись предмета в строке: Kürzel, полное имя или «Wie App» — имя, в узкой строке длинное → Kürzel. */
    fun title(lesson: Lesson, narrow: Boolean, density: Density): String = when (config.subject) {
        "kuerzel" -> lesson.code
        "name" -> lesson.title
        else -> shortTitle(lesson.title, lesson.code, narrow, density)
    }

    /** «Raum · Lehrkraft»: «Wie App» — кабинет всегда, учитель, когда есть место. */
    fun place(lesson: Lesson, wide: Boolean): String = when {
        config.place == "raum" || (config.place == "app" && !wide) -> lesson.room.orEmpty()
        else -> lesson.place
    }

    /** Данные старше 45 минут — сети не было: внизу «Stand Mi 07:12». */
    val offline get() = fetchedAt > 0 && System.currentTimeMillis() - fetchedAt > 45 * 60_000
}

private val PATHS = mapOf(
    "jetzt" to "/heute", "heute" to "/heute", "aenderungen" to "/heute", "woche" to "/woche",
    "tests" to "/testen", "aufgaben" to "/testen", "termine" to "/testen", "countdown" to "/testen", "notizen" to "/start",
    "noten" to "/noten", "neueNoten" to "/noten", "fehlzeiten" to "/fehlzeiten",
    "fuerDich" to "/start", "wetter" to "/heute", // часть 50c
)

/** «Beim Tippen öffnen»: Passend (по виду) или своя страница. */
private val OPEN = mapOf("tag" to "/heute", "woche" to "/woche", "tests" to "/testen", "start" to "/start")

/** Размер шрифта «Schrift S/M/L» — все Label виджета умножают на него. */
internal val LocalScale = staticCompositionLocalOf { 1f }

private fun openApp(context: Context, path: String) =
    Intent(context, MainActivity::class.java).setData(Uri.parse(Site.url(path))).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

@Composable
internal fun WidgetContent(context: Context, s: WidgetState) {
    val look = s.look
    // виды с оценками открывают свой раздел всегда: «Beim Tippen öffnen» у них нет
    val path = when {
        s.config.noten -> PATHS.getValue(s.config.kind)
        s.status != "ok" -> "/"
        else -> OPEN[s.config.open] ?: PATHS[s.config.kind] ?: "/"
    }
    val click = GlanceModifier.clickable(actionStartActivity(openApp(context, path)))
    val content: @Composable () -> Unit = {
        val bg = look.background
        val card = GlanceModifier.fillMaxSize().cornerRadius(look.radius.dp)
        Column((if (bg != null) card.background(bg) else card).padding(14.dp)) {
            val data = s.data
            when {
                s.config.noten -> NotenKind(s, look) // данные с телефона: вход в ORBook и сеть не важны
                s.status == "auth" -> Locked(s, look)
                s.status == "ended" -> Ended(s, look)
                data == null && s.status == "offline" -> NoConnection(s, look)
                data == null -> Loading(look)
                else -> Kind(s, data, look)
            }
        }
    }
    CompositionLocalProvider(LocalScale provides look.scale) {
        // Klar и Glas — с рамкой: внешний слой цвета рамки, внутри карточка на 1,5 dp меньше
        val edge = look.edge
        if (edge == null) Box(GlanceModifier.fillMaxSize().then(click)) { content() }
        else Box(GlanceModifier.fillMaxSize().cornerRadius(look.radius.dp).background(edge).padding(1.5.dp).then(click)) { content() }
    }
}

// ── общие кусочки: шапка, строки, текст ──

@Composable
internal fun Label(value: String, color: ColorProvider, size: Number, bold: Boolean = false, strike: Boolean = false, heavy: Boolean = false, lines: Int = 1) =
    Text(
        value,
        maxLines = lines,
        style = TextStyle(
            color = color,
            fontSize = (size.toFloat() * LocalScale.current).sp,
            fontWeight = if (bold || heavy) FontWeight.Bold else FontWeight.Normal,
            textDecoration = if (strike) TextDecoration.LineThrough else null,
        ),
    )

/** Высота шапки с отступом под ней — из места для строк её вычитают виды. */
internal const val HEADER_DP = 26f

@Composable
internal fun Header(s: WidgetState, look: Look, title: String, icon: Int, accent: Boolean = false, right: String? = null, chip: Boolean = false) {
    val color = look.of(if (accent) look.p.accentInk else look.p.faint)
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Image(ImageProvider(icon), null, GlanceModifier.size(14.dp), colorFilter = ColorFilter.tint(color))
        Spacer(GlanceModifier.width(6.dp))
        Box(GlanceModifier.defaultWeight()) { Label(title.uppercase(Locale.GERMAN), color, 11, bold = true) }
        val wide = LocalSize.current.width >= 250.dp
        if (right != null) Label(right, look.of(look.p.ink), 12, bold = true)
        // у широких виджетов — чип класса справа сверху (у узких места нет)
        val name = s.data?.className?.ifEmpty { null } ?: s.className
        if (chip && wide && right == null && name != null) {
            Box(GlanceModifier.cornerRadius(10.dp).background(look.of(look.p.tint)).padding(horizontal = 8.dp, vertical = 2.dp)) {
                Label(name, look.of(look.p.accentInk), 11, heavy = true)
            }
        }
    }
    Spacer(GlanceModifier.height(10.dp))
}

@Composable
internal fun Dot(color: ColorProvider, size: Int = 8) =
    Image(ImageProvider(R.drawable.w_dot), null, GlanceModifier.size(size.dp), colorFilter = ColorFilter.tint(color))

@Composable
internal fun Divider(look: Look) = Box(GlanceModifier.fillMaxWidth().height(1.dp).background(look.of(look.p.hair))) {}

@Composable
internal fun ColumnScope.Fill() = Spacer(GlanceModifier.defaultWeight())

/** «+ 3 weitere» — внизу, когда всё не влезло (правило 31d). */
@Composable
internal fun More(s: WidgetState, look: Look, hidden: Int) {
    if (hidden <= 0) return
    Box(GlanceModifier.fillMaxWidth().height(MORE_DP.dp), contentAlignment = Alignment.CenterStart) {
        Label(s.texts.t("+ {n} weitere", hidden), look.of(look.p.accentInk), 12, heavy = true)
    }
}

/** Сколько места под строками: высота виджета минус отступы, шапка и «Stand …». */
internal fun freeDp(s: WidgetState, height: Float, header: Boolean = true) =
    height - 28f - (if (header) HEADER_DP else 0f) - (if (s.offline) 20f else 0f)

@Composable
internal fun Footer(s: WidgetState, look: Look) {
    if (!s.offline) return
    val time = LocalDateTime.ofInstant(Instant.ofEpochMilli(s.fetchedAt), ZoneId.systemDefault())
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(ImageProvider(R.drawable.w_wifi_off), null, GlanceModifier.size(13.dp), colorFilter = ColorFilter.tint(look.of(look.p.faint)))
        Spacer(GlanceModifier.width(5.dp))
        Label(s.texts.t("Stand {n}", "${weekday(time.toLocalDate(), s.texts)} ${HHMM.format(time)}"), look.of(look.p.faint), 12, bold = true)
    }
}

@Composable
internal fun Empty(look: Look, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Dot(look.of(look.p.ok), 7)
        Spacer(GlanceModifier.width(6.dp))
        Label(value, look.of(look.p.ok), 12, bold = true)
    }
}

internal val HHMM: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")

private fun locale(texts: Texts) = Locale.forLanguageTag(texts.lang)

/** «Mo», «Di» … — без точки, как на сайте. */
internal fun weekday(date: LocalDate, texts: Texts) =
    date.format(DateTimeFormatter.ofPattern("EEE", locale(texts))).trimEnd('.').replaceFirstChar { it.uppercase() }

/** «Mo, 22. Sept» */
internal fun dayLabel(date: LocalDate, texts: Texts) =
    "${weekday(date, texts)}, ${date.dayOfMonth}. ${date.format(DateTimeFormatter.ofPattern("MMM", locale(texts))).trimEnd('.')}"

/** «heute», «morgen», «in 3 Tagen» */
internal fun daysLeft(date: LocalDate, today: LocalDate, texts: Texts): String = when (val n = ChronoUnit.DAYS.between(today, date)) {
    0L -> texts.t("heute")
    1L -> texts.t("morgen")
    else -> texts.t("in {n} Tagen", n)
}

// ── вид по настройке (сами виды — WidgetKinds.kt) ──

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
        "countdown" -> CountdownView(s, data, look, now)
        "fuerDich" -> FuerDichKind(s, data, look, now)
        "wetter" -> WetterKind(s, data, look, now)
        else -> Jetzt(s, data, look, now)
    }
}

// ── состояния без данных ──

@Composable
private fun ColumnScope.Locked(s: WidgetState, look: Look) {
    val t = s.texts
    Header(s, look, "ORBook", R.drawable.w_lock)
    Fill()
    Label(t.t("Nicht angemeldet"), look.of(look.p.ink), 16, heavy = true)
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.fillMaxWidth().height(36.dp).cornerRadius(18.dp).background(look.of(look.p.accent)), contentAlignment = Alignment.Center) {
        Label(t.t("Öffnen"), look.of(look.p.onAccent), 13, heavy = true)
    }
}

@Composable
private fun ColumnScope.Ended(s: WidgetState, look: Look) {
    val t = s.texts
    Header(s, look, s.className?.let { t.t("Klasse {n}", it) } ?: "ORBook", R.drawable.w_warn)
    Fill()
    Label(t.t("Zugang beendet"), look.of(look.p.danger), 16, heavy = true)
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.fillMaxWidth().height(36.dp).cornerRadius(18.dp).background(look.of(look.p.sand)), contentAlignment = Alignment.Center) {
        Label(t.t("Neuer Code"), look.of(look.p.ink), 13, heavy = true)
    }
}

/** Ни разу не загрузили, а сети нет: честно сказать, а не крутить загрузку вечно. */
@Composable
private fun ColumnScope.NoConnection(s: WidgetState, look: Look) {
    Header(s, look, "ORBook", R.drawable.w_wifi_off)
    Fill()
    Label(s.texts.t("Keine Verbindung"), look.of(look.p.faint), 15, heavy = true)
    Fill()
}

/** Только что положили на рабочий стол — данные ещё грузятся: серые полоски, как скелет на сайте. */
@Composable
private fun ColumnScope.Loading(look: Look) {
    val bar = look.of(look.p.skeleton)
    Box(GlanceModifier.width(90.dp).height(10.dp).cornerRadius(5.dp).background(bar)) {}
    Spacer(GlanceModifier.height(18.dp))
    Box(GlanceModifier.width(150.dp).height(20.dp).cornerRadius(10.dp).background(bar)) {}
    Spacer(GlanceModifier.height(10.dp))
    Box(GlanceModifier.width(200.dp).height(10.dp).cornerRadius(5.dp).background(bar)) {}
    Fill()
    Box(GlanceModifier.fillMaxWidth().height(6.dp).cornerRadius(3.dp).background(bar)) {}
}
