package net.orbitium.orbook

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.provider.Settings
import androidx.core.content.FileProvider
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors
import java.util.concurrent.Future

/**
 * Обновление без Google Play: качаем APK с нашего сайта, сверяем sha256 из /api/public/android
 * и отдаём файл установщику Android. Android сам проверит, что APK подписан тем же ключом.
 */
class UpdateInstaller(
    private val context: Context,
    private val send: (JSONObject) -> Unit,
) {
    private val worker = Executors.newSingleThreadExecutor()
    private var job: Future<*>? = null

    @Volatile
    private var cancelled = false

    fun start() {
        if (job?.isDone == false) return
        cancelled = false
        job = worker.submit {
            try {
                install(download())
                send(event("done"))
            } catch (e: Exception) {
                if (!cancelled) send(event("error").put("reason", reasonOf(e)))
            }
        }
    }

    fun cancel() {
        cancelled = true
        job?.cancel(true)
    }

    private fun download(): File {
        val release = JSONObject(open(Site.url("/api/public/android")).inputStream.bufferedReader().use { it.readText() })
        val total = release.getLong("size")
        val target = File(context.cacheDir, "updates/orbook.apk")
        target.parentFile?.mkdirs()
        val digest = MessageDigest.getInstance("SHA-256")
        open(Site.url("/api/public/android/apk")).inputStream.use { input ->
            target.outputStream().use { output ->
                val buffer = ByteArray(64 * 1024)
                var loaded = 0L
                var lastSent = 0L
                while (true) {
                    if (cancelled) throw InterruptedException()
                    val read = input.read(buffer)
                    if (read < 0) break
                    output.write(buffer, 0, read)
                    digest.update(buffer, 0, read)
                    loaded += read
                    // полоса загрузки: не чаще ~6 раз в секунду, чтобы не грузить сайт событиями
                    val now = SystemClock.elapsedRealtime()
                    if (now - lastSent > 150) {
                        send(event("download").put("loaded", loaded).put("total", total))
                        lastSent = now
                    }
                }
            }
        }
        val sha = digest.digest().joinToString("") { "%02x".format(it) }
        if (sha != release.getString("sha256")) {
            target.delete()
            throw ChecksumException()
        }
        send(event("download").put("loaded", total).put("total", total))
        return target
    }

    private fun install(apk: File) {
        // Первое обновление: Android просит разрешить ORBook ставить приложения — открываем этот экран
        if (!context.packageManager.canRequestPackageInstalls()) {
            val settings = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${context.packageName}"))
            context.startActivity(settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            throw PermissionException()
        }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", apk)
        val view = Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, APK_TYPE)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(view)
    }

    private fun open(url: String): HttpURLConnection {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.connectTimeout = 15_000
        connection.readTimeout = 30_000
        if (connection.responseCode != 200) throw IOException("HTTP ${connection.responseCode}")
        return connection
    }

    private fun event(type: String) = JSONObject().put("type", type)

    private fun reasonOf(e: Exception): String = when (e) {
        is PermissionException -> "permission"
        is ChecksumException -> "checksum"
        is JSONException -> "missing" // на сайте нет APK (ответ null)
        is IOException -> "network"
        else -> "unknown"
    }

    private class PermissionException : Exception()
    private class ChecksumException : Exception()

    companion object {
        const val APK_TYPE = "application/vnd.android.package-archive"
    }
}
