package net.orbitium.orbook.noten

import java.time.LocalDate

/**
 * Часть 36c: разбор страницы `getdata.php` cevex Home.InfoPoint — перенос `orbook/noten/parser.py`
 * (бэкенд) один в один, чтобы приложение отдавало сайту тот же JSON, что и `POST /api/noten/abrufen`.
 * Поменяли правило там — поменяй и здесь (тест NotenParserTest сверяет оба на образце).
 *
 * Результат — простые Map/List/String/Double/Int/Boolean/null: без org.json, чтобы тест шёл без телефона.
 */
object NotenParser {
    /** Страница входа вместо оценок — неверный логин. */
    class Denied : Exception()

    /** Страница не похожа на InfoPoint (поменялся формат или чужая страница). */
    class Changed(message: String) : Exception(message)

    private class Block(val kind: String) {
        var text = StringBuilder()
        var anchor: String? = null
        val cells = mutableListOf<String>()
        var header = false
    }

    /** HTML → список кусков, как HTMLParser в Python: заголовок, абзац, строка таблицы. */
    private class Blocks {
        val blocks = mutableListOf<Block>()
        var hasPasswordField = false
        private var open: Block? = null
        private var row: Block? = null
        private var cell: StringBuilder? = null

        fun start(tag: String, attrs: Map<String, String?>) {
            when {
                tag == "input" && attrs["name"] == "password" -> hasPasswordField = true
                tag == "h2" || tag == "h3" || tag == "p" -> open = Block(tag)
                tag == "a" && open != null && !attrs["name"].isNullOrEmpty() -> open!!.anchor = attrs["name"]
                tag == "table" -> blocks.add(Block("table"))
                tag == "tr" -> row = Block("row")
                (tag == "td" || tag == "th") && row != null -> {
                    cell = StringBuilder()
                    row!!.header = row!!.header || tag == "th"
                }
            }
        }

        fun end(tag: String) {
            val o = open
            val r = row
            when {
                (tag == "h2" || tag == "h3" || tag == "p") && o != null -> {
                    o.text = StringBuilder(clean(o.text.toString()))
                    blocks.add(o)
                    open = null
                }
                (tag == "td" || tag == "th") && r != null && cell != null -> {
                    r.cells.add(clean(cell.toString()))
                    cell = null
                }
                tag == "tr" && r != null -> {
                    blocks.add(r)
                    row = null
                }
            }
        }

        fun data(text: String) {
            val c = cell
            if (c != null) c.append(text) else open?.text?.append(text)
        }
    }

    // ---------- Значения ----------

    private val WEIGHTS = mapOf("einfach" to 1.0, "doppelt" to 2.0, "dreifach" to 3.0, "vierfach" to 4.0, "halb" to 0.5)
    private val GRADE = Regex("""^([1-6])\s*([+-]?)$""")
    private val MONTHS = listOf("januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember")
        .withIndex().associate { (i, m) -> m to i + 1 }

    // \s в Python понимает и неразрывный пробел и прочие пробелы Unicode — в Java нет, поэтому перечисляем
    private val SPACES = Regex("""[\s \u0085  -     　\u001C-\u001F]+""")

    fun clean(text: String): String = text.replace(' ', ' ').replace(SPACES, " ").trim()

    /** «2» → 2,0; «2+» → 1,7; «2-» → 2,3 (решение владельца ∓0,3); «m.E.», пусто → null. */
    fun gradeValue(text: String?): Double? {
        val m = GRADE.find((text ?: "").replace('−', '-').trim()) ?: return null
        val shift = when (m.groupValues[2]) { "+" -> -0.3; "-" -> 0.3; else -> 0.0 }
        return Math.round((m.groupValues[1].toInt() + shift) * 10) / 10.0
    }

    /** «09.09.2026» → "2026-09-09"; другое → null. */
    fun parseDate(text: String): String? {
        val m = Regex("""(\d{1,2})\.(\d{1,2})\.(\d{4})""").matchEntire(text.trim()) ?: return null
        return date(m.groupValues[3].toInt(), m.groupValues[2].toInt(), m.groupValues[1].toInt())
    }

    private fun date(year: Int, month: Int, day: Int): String? =
        runCatching { LocalDate.of(year, month, day).toString() }.getOrNull()

    /** «1.», «2. Hj.» → 1 / 2. */
    fun parseHalf(text: String): Int? = Regex("""^\s*([12])\b""").find(text)?.groupValues?.get(1)?.toInt()

    fun parseExcused(text: String): Boolean? {
        val t = text.trim().lowercase()
        return when {
            t.isEmpty() -> null
            t.startsWith("unent") || t.startsWith("nein") || t.startsWith("n") -> false
            t.startsWith("ent") || t.startsWith("ja") || t.startsWith("j") -> true
            else -> null
        }
    }

    fun firstNumber(text: String): Int? = Regex("""\d+""").find(text)?.value?.toIntOrNull()

    /** «Letzte Aktualisierung: Montag, 16. November 2026» → "2026-11-16". */
    fun parseUpdated(text: String): String? {
        val m = Regex("""(\d{1,2})\.\s*([A-Za-zäÄ]+)\s+(\d{4})""").find(text) ?: return parseDate(text.substringAfterLast(" "))
        val month = MONTHS[m.groupValues[2].lowercase()] ?: return null
        return date(m.groupValues[3].toInt(), month, m.groupValues[1].toInt())
    }

    private fun orNull(text: String): String? = text.ifEmpty { null }

    // ---------- Строки таблиц ----------

    /** Datum | Zensur | Bemerkung | Teilnote / Wichtung | Hj. */
    fun gradeRow(cells: List<String>): Map<String, Any?>? {
        if (cells.size < 5) return null
        val kind = cells[3].substringBefore("/")
        val weightLabel = if (cells[3].contains("/")) cells[3].substringAfter("/").trim().ifEmpty { null } else null
        return mapOf(
            "date" to parseDate(cells[0]),
            "grade" to orNull(cells[1]),
            "value" to gradeValue(cells[1]),
            "note" to orNull(cells[2]),
            "kind" to orNull(kind.trim()),
            "weightLabel" to weightLabel,
            "weight" to WEIGHTS[(weightLabel ?: "").lowercase()],
            "half" to parseHalf(cells[4]),
        )
    }

    /** Halbjahr | Zensur | Bemerkung. */
    fun finalRow(cells: List<String>): Map<String, Any?>? {
        val half = cells.firstOrNull()?.let(::parseHalf)
        if (half == null || cells.size < 2) return null
        return mapOf(
            "half" to half,
            "grade" to orNull(cells[1]),
            "value" to gradeValue(cells[1]),
            "note" to if (cells.size > 2) orNull(cells[2]) else null,
        )
    }

    /** Fehltage: Datum | Grund | Entschuldigt | Hj. */
    fun dayRow(cells: List<String>): Map<String, Any?>? {
        if (cells.size < 4) return null
        return mapOf("date" to parseDate(cells[0]), "reason" to orNull(cells[1]), "excused" to parseExcused(cells[2]), "half" to parseHalf(cells[3]))
    }

    /** Fehlstunden: Datum | Fach | Stunden / Minuten | Grund | Entschuldigt | Hj. */
    fun hourRow(cells: List<String>): Map<String, Any?>? {
        if (cells.size < 6) return null
        return mapOf(
            "date" to parseDate(cells[0]),
            "subject" to orNull(cells[1]),
            "amount" to orNull(cells[2]),
            "hours" to firstNumber(cells[2]),
            "reason" to orNull(cells[3]),
            "excused" to parseExcused(cells[4]),
            "half" to parseHalf(cells[5]),
        )
    }

    private val SUMMARY_KEYS = mapOf(
        "fehltage" to "days",
        "unentschuldigte fehltage" to "daysUnexcused",
        "fehlstunden" to "hours",
        "unentschuldigte fehlstunden" to "hoursUnexcused",
    )
    private val ABSENCE_SECTIONS = mapOf("Fehltage" to "days", "Fehlstunden" to "hours", "Zusammenfassung" to "summary")

    // ---------- Вся страница ----------

    /** HTML getdata.php → тот же словарь, что отдаёт сервер (без fetchedAt). Исключения: Denied, Changed. */
    fun parse(html: String): Map<String, Any?> {
        val p = Blocks()
        Html.tokenize(html, p::start, p::end, p::data)
        if (p.hasPasswordField) throw Denied()
        val headings = p.blocks.filter { it.kind == "h2" }.map { it.text.toString() }
        if (headings.none { it.startsWith("Zensuren") || it.startsWith("Fehlzeiten") }) throw Changed("Weder Zensuren noch Fehlzeiten gefunden")

        val subjects = mutableListOf<MutableMap<String, Any?>>()
        val days = mutableListOf<Map<String, Any?>>()
        val hours = mutableListOf<Map<String, Any?>>()
        val summary = linkedMapOf<String, Any?>().apply { SUMMARY_KEYS.values.forEach { put(it, null) } }
        var updated: String? = null
        var current: MutableMap<String, Any?>? = null
        var section = ""

        for (b in p.blocks) {
            val text = b.text.toString()
            when (b.kind) {
                "h3" -> {
                    val anchor = b.anchor
                    if (anchor != null && anchor.startsWith("f_")) {
                        current = subject(anchor, text).also(subjects::add)
                        section = "grades"
                    } else {
                        current = null
                        section = ABSENCE_SECTIONS[text] ?: ""
                    }
                }
                "h2" -> { current = null; section = "" }
                "p" -> when {
                    text == "Endnoten" && current != null -> section = "finals"
                    text.startsWith("Letzte Aktualisierung") -> updated = parseUpdated(text)
                }
                "row" -> if (!b.header) addRow(b.cells, section, current, days, hours, summary)
            }
        }
        return mapOf(
            "updatedAt" to updated,
            "subjects" to subjects,
            "absences" to mapOf("days" to days, "hours" to hours, "summary" to summary),
        )
    }

    // «Mathematik ( Lehrer)» — учителя отрезаем
    private fun subject(anchor: String, title: String): MutableMap<String, Any?> = linkedMapOf(
        "code" to anchor.substring(2).lowercase(),
        "name" to title.replace(Regex("""\s*\(.*\)\s*$"""), "").trim(),
        "grades" to mutableListOf<Map<String, Any?>>(),
        "finals" to mutableListOf<Map<String, Any?>>(),
    )

    @Suppress("UNCHECKED_CAST")
    private fun addRow(
        cells: List<String>,
        section: String,
        current: MutableMap<String, Any?>?,
        days: MutableList<Map<String, Any?>>,
        hours: MutableList<Map<String, Any?>>,
        summary: MutableMap<String, Any?>,
    ) {
        when {
            section == "grades" && current != null -> gradeRow(cells)?.let { row ->
                if (row["date"] != null || row["grade"] != null) (current["grades"] as MutableList<Map<String, Any?>>).add(row)
            }
            section == "finals" && current != null -> finalRow(cells)?.let { (current["finals"] as MutableList<Map<String, Any?>>).add(it) }
            section == "days" -> dayRow(cells)?.let { if (it["date"] != null) days.add(it) }
            section == "hours" -> hourRow(cells)?.let { if (it["date"] != null) hours.add(it) }
            section == "summary" && cells.size >= 2 -> SUMMARY_KEYS[cells[0].lowercase()]?.let { summary[it] = firstNumber(cells[1]) }
        }
    }
}
