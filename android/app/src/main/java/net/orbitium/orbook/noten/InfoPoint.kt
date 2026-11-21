package net.orbitium.orbook.noten

import net.orbitium.orbook.BuildConfig
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.nio.charset.Charset

/**
 * Часть 36c: сходить в cevex Home.InfoPoint прямо с телефона — как `orbook/noten/client.py` на сервере:
 * `default.php` (cookie сессии) → `POST login.php` → `getdata.php` → `logout.php`.
 * Редиректы сами не выполняем (удачный вход — 302 на getdata.php), cookie держим только на время запроса.
 */
object InfoPoint {
    class Denied : Exception()
    class Unreachable(message: String) : Exception(message)

    private const val TIMEOUT_MS = 15_000
    private const val MAX_BYTES = 2 * 1024 * 1024
    private val agent = "ORBook-Android/${BuildConfig.VERSION_NAME}"

    /** HTML страницы с оценками. Исключения: Denied, Unreachable. */
    fun fetchPage(baseUrl: String, username: String, password: String): String = session(baseUrl, username, password, listOf("getdata.php"))[0]

    /**
     * Часть 37: страница для печати «как есть» (mode "summary" | "detail") и стиль школы `css/site.css`
     * (в нём `@media print`). Стиль не пришёл — пустая строка.
     */
    fun fetchOriginal(baseUrl: String, username: String, password: String, mode: String): Pair<String, String> {
        require(mode == "summary" || mode == "detail")
        val pages = session(baseUrl, username, password, listOf("getdata.php?mode=$mode", "css/site.css"), optional = setOf(1))
        return pages[0] to pages[1]
    }

    // Войти, забрать страницы по порядку, выйти. optional — номера страниц, без которых можно (ошибка → "")
    private fun session(baseUrl: String, username: String, password: String, paths: List<String>, optional: Set<Int> = emptySet()): List<String> {
        val base = baseUrl.trimEnd('/')
        if (!base.startsWith("https://")) throw Unreachable("nur https")
        val cookies = linkedMapOf<String, String>()
        try {
            get("$base/default.php", cookies)
            login(base, username, password, cookies)
            try {
                return paths.mapIndexed { i, path ->
                    try {
                        get("$base/$path", cookies)
                    } catch (e: Exception) {
                        if (i in optional && (e is IOException || e is Unreachable)) "" else throw e
                    }
                }
            } finally {
                runCatching { request("$base/logout.php", cookies).disconnect() }
            }
        } catch (e: IOException) {
            throw Unreachable(e.javaClass.simpleName)
        }
    }

    private fun request(url: String, cookies: MutableMap<String, String>, form: String? = null): HttpURLConnection {
        val c = URL(url).openConnection() as HttpURLConnection
        c.instanceFollowRedirects = false
        c.connectTimeout = TIMEOUT_MS
        c.readTimeout = TIMEOUT_MS
        c.setRequestProperty("User-Agent", agent)
        if (cookies.isNotEmpty()) c.setRequestProperty("Cookie", cookies.entries.joinToString("; ") { "${it.key}=${it.value}" })
        if (form != null) {
            c.requestMethod = "POST"
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            c.outputStream.use { it.write(form.toByteArray()) }
        }
        c.responseCode // запрос уходит здесь
        // «Set-Cookie: PHPSESSID=…; path=/» — берём только имя=значение
        c.headerFields.filterKeys { it.equals("Set-Cookie", ignoreCase = true) }.values.flatten().forEach { line ->
            val pair = line.substringBefore(';')
            if ('=' in pair) cookies[pair.substringBefore('=').trim()] = pair.substringAfter('=').trim()
        }
        return c
    }

    private fun get(url: String, cookies: MutableMap<String, String>): String {
        val c = request(url, cookies)
        try {
            if (c.responseCode != 200) throw Unreachable("HTTP ${c.responseCode}")
            val body = ByteArrayOutputStream()
            c.inputStream.use { input ->
                val buffer = ByteArray(16 * 1024)
                while (true) {
                    val read = input.read(buffer)
                    if (read < 0) break
                    body.write(buffer, 0, read)
                    if (body.size() > MAX_BYTES) throw Unreachable("Antwort zu groß")
                }
            }
            return String(body.toByteArray(), charset(c.contentType))
        } finally {
            c.disconnect()
        }
    }

    /** Удачный вход — 302 на getdata.php. Остальное (форма снова, редирект на default.php) — неверные данные. */
    private fun login(base: String, username: String, password: String, cookies: MutableMap<String, String>) {
        fun enc(s: String) = URLEncoder.encode(s, "UTF-8")
        val c = request("$base/login.php", cookies, "username=${enc(username)}&password=${enc(password)}&login=Anmelden")
        try {
            val status = c.responseCode
            if (status >= 500) throw Unreachable("HTTP $status")
            val location = runCatching { URL(URL(base + "/"), c.getHeaderField("Location") ?: "").path }.getOrDefault("")
            if (status in 301..303 && location.endsWith("getdata.php")) return
            throw Denied()
        } finally {
            c.disconnect()
        }
    }

    // «text/html; charset=utf-8» → UTF-8; нет или неизвестная — UTF-8 (как httpx на сервере)
    private fun charset(contentType: String?): Charset {
        val name = contentType?.split(';')?.map { it.trim() }?.firstOrNull { it.startsWith("charset=", ignoreCase = true) }?.substringAfter('=')?.trim('"', ' ')
        return name?.let { runCatching { Charset.forName(it) }.getOrNull() } ?: Charsets.UTF_8
    }
}
