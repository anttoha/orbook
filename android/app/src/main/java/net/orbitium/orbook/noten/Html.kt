package net.orbitium.orbook.noten

/**
 * Часть 36c: маленький разборщик HTML «по событиям», как html.parser в Python: начало тега, конец тега, текст.
 * Дерево не строим — NotenParser сам идёт по тегам сверху вниз (так же, как бэкенд). Своё, а не библиотека:
 * нужно ровно то же поведение, что у сервера, и APK не растёт.
 */
object Html {
    private val TAG_NAME = Regex("""[A-Za-z][^\s/>]*""")
    private val ATTR = Regex("""([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?""")
    private val RAW_TEXT = setOf("script", "style") // содержимое — просто текст, как в Python

    fun tokenize(
        html: String,
        start: (String, Map<String, String?>) -> Unit,
        end: (String) -> Unit,
        data: (String) -> Unit,
    ) {
        var i = 0
        val n = html.length
        while (i < n) {
            val lt = html.indexOf('<', i)
            if (lt < 0) { data(unescape(html.substring(i))); break }
            if (lt > i) data(unescape(html.substring(i, lt)))
            when {
                html.startsWith("<!--", lt) -> {
                    val close = html.indexOf("-->", lt + 4)
                    i = if (close < 0) n else close + 3
                }
                html.startsWith("</", lt) -> {
                    val close = html.indexOf('>', lt)
                    if (close < 0) { data(unescape(html.substring(lt))); break }
                    TAG_NAME.find(html.substring(lt + 2, close))?.let { end(it.value.lowercase()) }
                    i = close + 1
                }
                lt + 1 < n && (html[lt + 1] == '!' || html[lt + 1] == '?') -> {
                    val close = html.indexOf('>', lt)
                    i = if (close < 0) n else close + 1
                }
                lt + 1 < n && html[lt + 1].isLetter() -> {
                    val close = tagEnd(html, lt)
                    if (close < 0) { data(unescape(html.substring(lt))); break }
                    val inner = html.substring(lt + 1, close)
                    val name = TAG_NAME.find(inner)!!.value
                    val tag = name.lowercase()
                    start(tag, attributes(inner.substring(name.length)))
                    i = close + 1
                    if (tag in RAW_TEXT) {
                        val stop = html.indexOf("</$tag", i, ignoreCase = true).let { if (it < 0) n else it }
                        if (stop > i) data(html.substring(i, stop))
                        i = stop
                    }
                }
                else -> { data("<"); i = lt + 1 }
            }
        }
    }

    /** Конец тега: «>» вне кавычек. */
    private fun tagEnd(html: String, from: Int): Int {
        var quote: Char? = null
        for (j in from + 1 until html.length) {
            val c = html[j]
            if (quote != null) { if (c == quote) quote = null }
            else if (c == '"' || c == '\'') quote = c
            else if (c == '>') return j
        }
        return -1
    }

    private fun attributes(text: String): Map<String, String?> =
        ATTR.findAll(text).associate { m ->
            val value = m.groups[2]?.value ?: m.groups[3]?.value ?: m.groups[4]?.value
            m.groupValues[1].lowercase() to value?.let(::unescape)
        }

    private val ENTITY = Regex("""&(#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);""")
    private val NAMED = mapOf(
        "nbsp" to " ", "amp" to "&", "lt" to "<", "gt" to ">", "quot" to "\"", "apos" to "'",
        "auml" to "ä", "ouml" to "ö", "uuml" to "ü", "Auml" to "Ä", "Ouml" to "Ö", "Uuml" to "Ü", "szlig" to "ß",
        "eacute" to "é", "Eacute" to "É", "egrave" to "è", "agrave" to "à", "aacute" to "á", "ccedil" to "ç",
        "copy" to "©", "reg" to "®", "euro" to "€", "deg" to "°", "middot" to "·", "shy" to "­",
        "ndash" to "–", "mdash" to "—", "hellip" to "…", "laquo" to "«", "raquo" to "»",
        "bdquo" to "„", "ldquo" to "“", "rdquo" to "”", "sbquo" to "‚", "lsquo" to "‘", "rsquo" to "’",
        "frac12" to "½", "sup2" to "²", "times" to "×", "minus" to "−",
    )

    fun unescape(text: String): String {
        if (!text.contains('&')) return text
        return ENTITY.replace(text) { m ->
            val name = m.groupValues[1]
            when {
                name.startsWith("#x") || name.startsWith("#X") -> name.substring(2).toIntOrNull(16)?.let(::codePoint)
                name.startsWith("#") -> name.substring(1).toIntOrNull()?.let(::codePoint)
                else -> NAMED[name]
            } ?: m.value
        }
    }

    private fun codePoint(cp: Int): String? = if (Character.isValidCodePoint(cp) && cp != 0) String(Character.toChars(cp)) else null
}
