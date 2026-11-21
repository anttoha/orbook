package net.orbitium.orbook.noten

import android.content.Context
import android.webkit.CookieManager
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import net.orbitium.orbook.Site
import net.orbitium.orbook.notify.Note
import net.orbitium.orbook.notify.Notifier
import net.orbitium.orbook.notify.NotifySettings
import net.orbitium.orbook.widget.WidgetStore
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.time.LocalTime
import java.util.concurrent.TimeUnit

/**
 * Часть 36c: загрузка Noten в приложении — по кнопке на сайте (мост) и в фоне раз в 3 часа.
 * С адресом InfoPoint — прямо в школу (сервер ORBook оценок не видит); без адреса (демо) — через
 * `POST /api/noten/abrufen`, как сайт. Лимиты те же, что у сервера: удачно — раз в 5 минут, 5 попыток за 10 минут.
 */
object NotenCheck {
    /** Ответ: data — JSON как у сервера, или код ошибки как у сервера (infopoint_denied, too_often …). */
    data class Outcome(val data: String? = null, val code: String? = null, val retryAfter: Int? = null)

    private const val COOLDOWN_MS = 5 * 60_000L
    private const val TRIES = 5
    private const val WINDOW_MS = 10 * 60_000L

    /**
     * password null — взять сохранённый. remember — запомнить логин и оценки (иначе всё сохранённое стираем).
     * Удачно — оценки, которых ещё не было, становятся «seen» (фон потом сообщает только о новых).
     */
    fun fetch(context: Context, url: String?, username: String?, password: String?, remember: Boolean): Outcome {
        val store = NotenStore(context)
        val saved = store.login()
        val user = username?.takeIf { it.isNotBlank() } ?: saved?.username
        val pass = password?.takeIf { it.isNotEmpty() } ?: saved?.password?.takeIf { saved.username == user }
        if (user == null || pass == null) return Outcome(code = "no_login")
        limit(store)?.let { return it }

        val result = load(context, url, user, pass)
        if (result.data != null) {
            val now = System.currentTimeMillis()
            store.markOk(now)
            if (remember) {
                store.saveLogin(NotenStore.Login(url, user, pass))
                store.saveData(result.data, now)
                store.saveSeen(gradeKeys(result.data))
            } else {
                store.clear()
            }
        } else if (result.code == "infopoint_denied" && saved != null && saved.username == user) {
            store.forgetPassword()
        }
        NotenWorker.schedule(context)
        return result
    }

    /** Фон: новые оценки → уведомление. Возвращает false, если пробовать дальше смысла нет. */
    fun background(context: Context) {
        val store = NotenStore(context)
        val login = store.login() ?: return
        val before = store.seen()
        val outcome = fetch(context, login.url, login.username, login.password, remember = true)
        val data = outcome.data ?: return
        if (before == null) return // первый раз — всё «уже было»
        val fresh = newGrades(data, before)
        if (fresh.isNotEmpty()) notify(context, fresh)
    }

    private fun limit(store: NotenStore): Outcome? {
        val now = System.currentTimeMillis()
        val wait = store.lastOk() + COOLDOWN_MS - now
        if (wait > 0) return Outcome(code = "too_often", retryAfter = ((wait + 999) / 1000).toInt())
        val recent = store.tries().filter { now - it < WINDOW_MS }
        if (recent.size >= TRIES) return Outcome(code = "too_often", retryAfter = ((recent.min() + WINDOW_MS - now + 999) / 1000).toInt())
        store.saveTries(recent + now)
        return null
    }

    private fun load(context: Context, url: String?, username: String, password: String): Outcome =
        if (url == null) viaServer(context, username, password) else try {
            val parsed = NotenParser.parse(InfoPoint.fetchPage(url, username, password))
            Outcome(data = Json.write(parsed + ("fetchedAt" to Instant.now().toString())))
        } catch (e: InfoPoint.Denied) {
            Outcome(code = "infopoint_denied")
        } catch (e: NotenParser.Denied) {
            Outcome(code = "infopoint_denied")
        } catch (e: InfoPoint.Unreachable) {
            Outcome(code = "infopoint_unreachable")
        } catch (e: Exception) {
            Outcome(code = "infopoint_changed")
        }

    /** Демо (адреса нет): тот же запрос, что делает сайт, с cookie входа из WebView. */
    private fun viaServer(context: Context, username: String, password: String): Outcome {
        val c = URL(Site.url("/api/noten/abrufen")).openConnection() as HttpURLConnection
        return try {
            c.connectTimeout = 15_000
            c.readTimeout = 25_000
            c.requestMethod = "POST"
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            // сервер пускает POST только со своего сайта (проверка Origin, docs/API.md «CSRF») — без него 403 origin_rejected
            c.setRequestProperty("Origin", Site.url(""))
            CookieManager.getInstance().getCookie(Site.url("/"))?.let { c.setRequestProperty("Cookie", it) }
            c.outputStream.use { it.write(JSONObject().put("username", username).put("password", password).toString().toByteArray()) }
            val status = c.responseCode
            val body = (if (status < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""
            if (status == 200) return Outcome(data = body)
            val error = runCatching { JSONObject(body).getJSONObject("error") }.getOrNull()
            Outcome(code = error?.optString("code")?.ifEmpty { null } ?: "infopoint_unreachable", retryAfter = error?.optJSONObject("details")?.optInt("retryAfter"))
        } catch (e: IOException) {
            Outcome(code = "infopoint_unreachable")
        } finally {
            c.disconnect()
        }
    }

    // ── новые оценки ──

    /** Как gradeKey в src/shared/utils/noten.js: «код|дата|оценка|замечание», null → пусто. */
    private fun gradeKeys(data: String): Set<String> = grades(data).map { it.second }.toSet()

    /** [(предмет, ключ)] всех оценок. */
    private fun grades(data: String): List<Pair<JSONObject, String>> {
        val subjects = runCatching { JSONObject(data).getJSONArray("subjects") }.getOrNull() ?: return emptyList()
        return (0 until subjects.length()).flatMap { i ->
            val s = subjects.getJSONObject(i)
            val list = s.optJSONArray("grades") ?: return@flatMap emptyList()
            (0 until list.length()).map { j ->
                val g = list.getJSONObject(j)
                fun f(name: String) = if (g.isNull(name)) "" else g.optString(name)
                s to listOf(s.optString("code"), f("date"), f("grade"), f("note")).joinToString("|")
            }
        }
    }

    /** Предметы с новыми оценками (с текстом оценки — «m.E.» без оценки не считаем). */
    private fun newGrades(data: String, seen: Set<String>): List<JSONObject> =
        grades(data).filter { (_, key) -> key !in seen && key.split('|').getOrNull(2)?.isNotEmpty() == true }
            .map { it.first }.distinctBy { it.optString("code") }

    /** «Neue Note in Mathematik» / «Neue Noten in Mathematik, Deutsch»; нажатие — предмет или весь раздел. */
    private fun notify(context: Context, subjects: List<JSONObject>) {
        val texts = WidgetStore(context).snapshot().texts
        val names = subjects.joinToString(", ") { it.optString("name") }
        val text = texts.t(if (subjects.size == 1) "Neue Note in {n}" else "Neue Noten in {n}", names)
        val path = if (subjects.size == 1) "/noten/${subjects[0].optString("code")}" else "/noten"
        Notifier.post(context, Note("noten-${System.currentTimeMillis()}", text, path), Notifier.NOTEN, texts)
    }
}

/** Фон: раз в 3 часа, только с сетью; включено «Neue Note», Mitteilungen разрешены и логин сохранён. */
class NotenWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val settings = NotifySettings.load(applicationContext)
        if (active(applicationContext) && !settings.quiet(LocalTime.now())) {
            withContext(Dispatchers.IO) { NotenCheck.background(applicationContext) }
        }
        return Result.success()
    }

    companion object {
        private const val PERIODIC = "orbook-noten"

        fun active(context: Context): Boolean {
            val settings = NotifySettings.load(context)
            return settings.on && settings.newGrade && Notifier.permission(context) == "granted" && NotenStore(context).login() != null
        }

        fun schedule(context: Context) {
            val work = WorkManager.getInstance(context)
            if (!active(context)) { work.cancelUniqueWork(PERIODIC); return }
            val request = PeriodicWorkRequestBuilder<NotenWorker>(3, TimeUnit.HOURS)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            // KEEP: повторное включение не сдвигает уже назначенную проверку
            work.enqueueUniquePeriodicWork(PERIODIC, ExistingPeriodicWorkPolicy.KEEP, request)
        }
    }
}
