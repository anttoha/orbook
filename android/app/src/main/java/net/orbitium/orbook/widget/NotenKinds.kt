package net.orbitium.orbook.widget

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ColumnScope
import androidx.glance.layout.Row
import androidx.glance.layout.RowScope
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.unit.ColorProvider
import net.orbitium.orbook.R
import java.time.LocalDate

/*
 * Часть 39: виды «Noten», «Neue Noten», «Fehlzeiten» (макет design/neu/39-widget-noten).
 * Данные — NotenView (NotenWidget.kt) из того, что приложение уже хранит. «Noten anzeigen» выключено
 * (по умолчанию) — вместо оценок и чисел «•••»: виджет видит любой, кто смотрит на телефон.
 * Размеры и правило «плотнее → + N weitere» — как у остальных видов (WidgetKinds.kt, 31d).
 */

private const val HIDDEN = "•••"
private val GRADE_MODES = listOf(Mode(Density.NORMAL, 46), Mode(Density.KOMPAKT, 30), Mode(Density.DICHT, 23))

private val narrowNow: Boolean @Composable get() = LocalSize.current.width < 200.dp
private val oneRowNow: Boolean @Composable get() = LocalSize.current.height < 110.dp

/** Сколько места под строками: высота минус отступы карточки, шапка и то, что над списком. */
@Composable
private fun free(above: Float) = LocalSize.current.height.value - 28f - HEADER_DP - above

private fun dotDate(date: LocalDate) = "%02d.%02d.".format(date.dayOfMonth, date.monthValue)

/** Плашка оценки: цвет по оценке; скрыто — нейтральная «•••», по ней не угадать, хорошая ли. */
@Composable
private fun Pill(look: Look, text: String, value: Double?, show: Boolean, small: Boolean = false) {
    val (bg, fg) = when (if (show) gradeTone(value) else "none") {
        "good" -> look.p.okTint to look.p.ok
        "bad" -> look.p.dangerTint to look.p.danger
        "mid" -> look.p.sand to look.p.ink
        else -> look.p.sand to look.p.faint
    }
    val h = if (small) 19 else 24
    Box(
        GlanceModifier.height(h.dp).width(if (small) 38.dp else 44.dp).cornerRadius((h / 2).dp).background(look.of(bg)),
        contentAlignment = Alignment.Center,
    ) { Label(if (show) text else HIDDEN, look.of(fg), if (small) 12 else 13, heavy = true) }
}

@Composable
private fun NewBadge(s: WidgetState, look: Look) {
    Spacer(GlanceModifier.width(5.dp))
    Box(GlanceModifier.cornerRadius(8.dp).background(look.of(look.p.accent)).padding(horizontal = 6.dp, vertical = 1.dp)) {
        Label(s.texts.t("neu"), look.of(look.p.onAccent), 10, heavy = true)
    }
}

@Composable
private fun SubjectDot(s: WidgetState, look: Look, code: String) = Dot(look.of(Soft.fach(notenBadge(code), s.snapshot.palette).solid), 8)

/** Крупное число («2,1», «2») или «•••». */
@Composable
private fun Big(look: Look, value: String, show: Boolean, size: Int, color: Tone = look.p.ink) =
    Label(if (show) value else HIDDEN, look.of(if (show) color else look.p.faint), size, heavy = true)

@Composable
private fun RowScope.Caption(look: Look, text: String, color: ColorProvider = look.of(look.p.muted), size: Number = 12.5f) {
    Spacer(GlanceModifier.width(6.dp))
    Box(GlanceModifier.padding(bottom = 3.dp)) { Label(text, color, size, bold = true) }
}

/** Пусто или нет входа: одна строка по центру. */
@Composable
private fun ColumnScope.Center(look: Look, text: String, color: Tone = look.p.ink) {
    Fill()
    Box(GlanceModifier.fillMaxWidth(), contentAlignment = Alignment.Center) { Label(text, look.of(color), 14, heavy = true, lines = 2) }
    Fill()
}

/** Вид с оценками: нет сохранённых оценок (не вошёл, без «Angemeldet bleiben», «Abmelden») — позвать в приложение. */
@Composable
internal fun ColumnScope.NotenKind(s: WidgetState, look: Look) {
    val v = s.noten
    val t = s.texts
    if (v == null) {
        val (title, icon) = when (s.config.kind) {
            "neueNoten" -> t.t("Neue Noten") to R.drawable.w_star
            "fehlzeiten" -> t.t("Fehlzeiten") to R.drawable.w_calendar_x
            else -> t.t("Noten") to R.drawable.w_noten
        }
        Header(s, look, title, icon, accent = true)
        Center(look, t.t("In ORBook bei Noten anmelden"))
        return
    }
    when (s.config.kind) {
        "neueNoten" -> NeueNoten(s, v, look)
        "fehlzeiten" -> Fehlzeiten(s, v, look)
        else -> Noten(s, v, look)
    }
}

// ════════════════════ Noten: Schnitt и предметы ════════════════════

@Composable
private fun ColumnScope.Noten(s: WidgetState, v: NotenView, look: Look) {
    val t = s.texts
    val show = s.config.showGrades
    val narrow = narrowNow
    val stand = v.stand?.let { t.t("Stand {n}", dotDate(it)) }
    Header(s, look, t.t("Noten"), R.drawable.w_noten, accent = true, right = if (narrow) null else stand)
    if (v.subjects.isEmpty()) { Center(look, t.t("Noch keine Noten"), look.p.muted); return }
    val newest = v.latest.firstOrNull { it.fresh }
    Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
        Big(look, noteNumber(v.average), show, if (oneRowNow) 22 else 28)
        Caption(look, t.t("Schnitt"))
        Spacer(GlanceModifier.defaultWeight())
        if (oneRowNow && newest != null) {
            if (narrow) NewBadge(s, look)
            else Box(GlanceModifier.padding(bottom = 3.dp)) {
                Label("${t.t("Neu:")} ${newest.subject}${if (show) " ${newest.grade}" else ""}", look.of(look.p.accentInk), 13, heavy = true)
            }
        }
    }
    if (oneRowNow) return
    Spacer(GlanceModifier.height(6.dp))
    Divider(look)
    val avail = free(50f)
    val prio = { x: GradeSubject -> if (x.fresh) 0 else 1 + v.subjects.indexOf(x) }
    val fit = if (narrow) fit(v.subjects, avail, GRADE_MODES, prio) else fitColumns(v.subjects, avail, GRADE_MODES, prio)
    if (narrow) {
        fit.shown.forEachIndexed { i, x -> if (i > 0) Divider(look); SubjectRow(s, look, x, fit.density, fit.rowDp, show, true) }
    } else {
        // две колонки: левая — первая половина, правая — вторая (как читают сверху вниз)
        val half = (fit.shown.size + 1) / 2
        Row(GlanceModifier.fillMaxWidth()) {
            listOf(fit.shown.take(half), fit.shown.drop(half)).forEachIndexed { c, column ->
                if (c > 0) Spacer(GlanceModifier.width(10.dp))
                Column(GlanceModifier.defaultWeight()) {
                    column.forEachIndexed { i, x -> if (i > 0) Divider(look); SubjectRow(s, look, x, fit.density, fit.rowDp, show, false) }
                }
            }
        }
    }
    More(s, look, fit.hidden)
}

@Composable
private fun SubjectRow(s: WidgetState, look: Look, x: GradeSubject, density: Density, rowDp: Float, show: Boolean, narrow: Boolean) {
    val name = if (narrow && x.name.length > 9) notenBadge(x.code) else x.name
    Row(GlanceModifier.fillMaxWidth().height(rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
        SubjectDot(s, look, x.code)
        Spacer(GlanceModifier.width(8.dp))
        Row(GlanceModifier.defaultWeight(), verticalAlignment = Alignment.CenterVertically) {
            Label(name, look.of(look.p.ink), when (density) { Density.DICHT -> 12.5f; Density.NORMAL -> 14; else -> 13.5f }, heavy = true)
            if (x.fresh) NewBadge(s, look)
        }
        Pill(look, noteNumber(x.average), x.average, show, small = density == Density.DICHT)
    }
}

// ════════════════════ Neue Noten: последние оценки ════════════════════

@Composable
private fun ColumnScope.NeueNoten(s: WidgetState, v: NotenView, look: Look) {
    val t = s.texts
    val show = s.config.showGrades
    val narrow = narrowNow
    val first = v.latest.firstOrNull()
    if (oneRowNow) {
        Header(s, look, t.t("Neue Noten"), R.drawable.w_star, accent = true, right = if (narrow || first?.date == null) null else "${weekday(first.date, t)} ${dotDate(first.date)}")
        if (first == null) { Label(t.t("Noch keine Noten"), look.of(look.p.muted), 14, heavy = true); return }
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(GlanceModifier.defaultWeight()) {
                Label(first.subject, look.of(look.p.ink), 15, heavy = true)
                val sub = listOfNotNull(first.what, if (narrow) first.date?.let { weekday(it, t) } else null).joinToString(" · ")
                if (sub.isNotEmpty()) Label(sub, look.of(look.p.faint), 11.5f)
            }
            Pill(look, first.grade, first.value, show)
        }
        return
    }
    Header(s, look, if (narrow) t.t("Neu:").trimEnd(':') else t.t("Neue Noten"), R.drawable.w_star, accent = true, right = if (narrow) null else t.t("{n}. Halbjahr", v.half))
    if (v.latest.isEmpty()) { Center(look, t.t("Noch keine Noten"), look.p.muted); return }
    val fit = fit(v.latest, free(0f), GRADE_MODES) { v.latest.indexOf(it) }
    fit.shown.forEachIndexed { i, x ->
        if (i > 0) Divider(look)
        GradeRow(s, look, x, fit.density, fit.rowDp, show, narrow)
    }
    More(s, look, fit.hidden)
}

@Composable
private fun GradeRow(s: WidgetState, look: Look, x: GradeEntry, density: Density, rowDp: Float, show: Boolean, narrow: Boolean) {
    val t = s.texts
    val name = if (narrow && x.subject.length > 9) notenBadge(x.code) else x.subject
    val date = x.date?.let { "${weekday(it, t)} ${dotDate(it)}" }
    Row(GlanceModifier.fillMaxWidth().height(rowDp.dp), verticalAlignment = Alignment.CenterVertically) {
        SubjectDot(s, look, x.code)
        Spacer(GlanceModifier.width(8.dp))
        if (density == Density.NORMAL) {
            Column(GlanceModifier.defaultWeight()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Label(name, look.of(look.p.ink), 14, heavy = true)
                    if (x.fresh) NewBadge(s, look)
                }
                val sub = if (narrow) listOfNotNull(x.what) else listOfNotNull(x.what, date)
                if (sub.isNotEmpty()) Label(sub.joinToString(" · "), look.of(look.p.faint), 11.5f)
            }
        } else {
            Row(GlanceModifier.defaultWeight(), verticalAlignment = Alignment.CenterVertically) {
                Label(name, look.of(look.p.ink), if (density == Density.DICHT) 12.5f else 13.5f, heavy = true)
                if (x.fresh) NewBadge(s, look)
                if (!narrow && x.what != null) { Spacer(GlanceModifier.width(8.dp)); Label(x.what, look.of(look.p.faint), 11.5f) }
            }
            if (!narrow && date != null) { Label(date, look.of(look.p.faint), 11.5f); Spacer(GlanceModifier.width(8.dp)) }
        }
        Pill(look, x.grade, x.value, show, small = density == Density.DICHT)
    }
}

// ════════════════════ Fehlzeiten ════════════════════

@Composable
private fun ColumnScope.Fehlzeiten(s: WidgetState, v: NotenView, look: Look) {
    val t = s.texts
    val show = s.config.showGrades
    val narrow = narrowNow
    val st = v.stats
    val bad = st.unexcused > 0
    Header(s, look, t.t("Fehlzeiten"), R.drawable.w_calendar_x, right = if (narrow) null else t.t("{n}. Halbjahr", v.half))
    if (st.days == 0 && st.hours == 0 && v.absences.isEmpty()) { Empty(look, t.t("Keine Fehlzeiten")); return }
    val danger = if (bad) look.p.danger else look.p.ink
    if (oneRowNow) {
        Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
            if (narrow) {
                Big(look, "${st.days}", show, 22); Caption(look, t.t("Tage"))
            } else {
                listOf(Triple("${st.days}", t.t("Tage"), look.p.ink), Triple("${st.hours}", t.t("Std."), look.p.ink), Triple("${st.unexcused}", t.t("unentsch."), danger))
                    .forEach { (n, unit, color) ->
                        Row(GlanceModifier.defaultWeight(), verticalAlignment = Alignment.Bottom) {
                            Big(look, n, show, 22, color); Caption(look, unit, look.of(if (show && color == danger && bad) look.p.danger else look.p.muted), 12)
                        }
                    }
            }
        }
        if (narrow && show) Label("${st.hours} ${t.t("Std.")} · ${st.unexcused} ${t.t("unentsch.")}", look.of(if (bad) look.p.danger else look.p.faint), 11.5f, bold = bad)
        return
    }
    if (narrow) {
        // 2×2: дни крупно, ниже часы и без извинения
        Row(verticalAlignment = Alignment.Bottom) { Big(look, "${st.days}", show, 28); Caption(look, t.t("Fehltage"), size = 13) }
        Spacer(GlanceModifier.height(6.dp))
        listOf(Triple(t.t("Fehlstunden"), "${st.hours}", look.p.ink), Triple(t.t("unentschuldigt"), "${st.unexcused}", danger)).forEach { (label, n, color) ->
            Divider(look)
            Row(GlanceModifier.fillMaxWidth().height(28.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(GlanceModifier.defaultWeight()) { Label(label, look.of(look.p.ink), 12.5f, bold = true) }
                Label(if (show) n else HIDDEN, look.of(if (show) color else look.p.faint), 13.5f, heavy = true)
            }
        }
        return
    }
    // широкий: три плитки, на 4×3 и выше — последние пропуски
    Row(GlanceModifier.fillMaxWidth()) {
        listOf(Triple("${st.days}", t.t("Fehltage"), look.p.ink), Triple("${st.hours}", t.t("Fehlstunden"), look.p.ink), Triple("${st.unexcused}", t.t("unentschuldigt"), danger))
            .forEachIndexed { i, (n, label, color) ->
                if (i > 0) Spacer(GlanceModifier.width(8.dp))
                Column(GlanceModifier.defaultWeight().height(66.dp).cornerRadius(look.cellRadius.dp).background(look.of(look.p.sand)).padding(horizontal = 10.dp, vertical = 8.dp)) {
                    Big(look, n, show, 24, color)
                    Fill()
                    Label(label, look.of(look.p.muted), 10.5f, bold = true)
                }
            }
    }
    val avail = free(66f + 34f)
    if (avail < 31f || v.absences.isEmpty()) return
    Spacer(GlanceModifier.height(14.dp))
    Label(t.t("Zuletzt"), look.of(look.p.faint), 12.5f, bold = true)
    val rows = v.absences.take((avail / 31f).toInt())
    rows.forEachIndexed { i, a ->
        if (i > 0) Divider(look)
        Row(GlanceModifier.fillMaxWidth().height(31.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(GlanceModifier.width(82.dp)) { Label(a.date?.let { "${weekday(it, t)} ${dotDate(it)}" } ?: "–", look.of(look.p.ink), 13, heavy = true) }
            Box(GlanceModifier.defaultWeight()) { Label(if (show) absenceTitle(a, s.texts) else HIDDEN, look.of(if (show) look.p.muted else look.p.faint), 12.5f) }
            if (show && a.excused != null) {
                Label(t.t(if (a.excused) "entschuldigt" else "unentschuldigt"), look.of(if (a.excused) look.p.ok else look.p.danger), 11.5f, heavy = true)
            }
        }
    }
}

/** «Ganzer Tag», «3 Stunden», иначе текст InfoPoint — как absenceEntries на сайте. */
private fun absenceTitle(a: Absence, t: Texts): String = when {
    a.wholeDay -> t.t("Ganzer Tag")
    a.hours == null -> a.amount ?: t.t("Fehlstunden")
    a.hours == 1 -> t.t("{n} Stunde", 1)
    else -> t.t("{n} Stunden", a.hours)
}
