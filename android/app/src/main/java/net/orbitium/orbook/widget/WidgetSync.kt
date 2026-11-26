package net.orbitium.orbook.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.net.Uri
import android.webkit.CookieManager
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import net.orbitium.orbook.Site
import net.orbitium.orbook.notify.Notifications
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

/**
 * Загрузка данных виджетов: GET /api/widget с cookie входа из WebView приложения.
 * Каждый класс (и «Nur meine Kurse» вкл/выкл) спрашивается один раз, сколько бы виджетов его ни показывали.
 */
object WidgetSync {
    suspend fun run(context: Context) {
        val store = WidgetStore(context)
        val snapshot = store.snapshot()
        val manager = GlanceAppWidgetManager(context)
        val configs = manager.getGlanceIds(OrbWidget::class.java)
            .mapNotNull { store.config(manager.getAppWidgetId(it)) }
            .filterNot { it.noten } // часть 39: оценки берутся с телефона, у сервера спрашивать нечего
        // часть 31e: включены уведомления — загружаем и классы без виджета («Meine Kurse»)
        val notify = if (Notifications.active(context)) Notifications.classIds(context).map { it to true } else emptyList()
        for ((classId, mine) in (configs.map { it.classId to it.mineWith(snapshot) } + notify).distinct()) {
            val own = snapshot.classes.firstOrNull { it.id == classId }
            fetch(store, classId, mine, own)
        }
        Notifications.afterSync(context)
        OrbWidget().updateAll(context)
    }

    private fun fetch(store: WidgetStore, classId: Int?, mine: Boolean, own: SnapshotClass?) {
        val key = WidgetStore.key(classId, mine)
        val query = Uri.Builder()
        if (mine && own != null) {
            if (own.courses.isNotEmpty()) query.appendQueryParameter("courses", own.courses.joinToString(","))
            if (own.hidden.isNotEmpty()) query.appendQueryParameter("hidden", own.hidden.joinToString(","))
        }
        val url = Site.url("/api/widget") + (query.build().encodedQuery?.let { "?$it" } ?: "")
        val connection = URL(url).openConnection() as HttpURLConnection
        try {
            connection.connectTimeout = 15_000
            connection.readTimeout = 20_000
            CookieManager.getInstance().getCookie(Site.url("/"))?.let { connection.setRequestProperty("Cookie", it) }
            classId?.let { connection.setRequestProperty("X-ORBook-Class", it.toString()) }
            if (store.data(key) != null) store.etag(key)?.let { connection.setRequestProperty("If-None-Match", it) }
            val now = System.currentTimeMillis()
            when (connection.responseCode) {
                200 -> store.saveData(key, connection.inputStream.bufferedReader().use { it.readText() }, connection.getHeaderField("ETag"), now)
                304 -> store.touch(key, now)
                401 -> store.saveState(key, "auth")
                403 -> store.saveState(key, "ended")
                // остальное (сервер занят, 5xx) — оставляем последние данные, виджет покажет «Stand …»
            }
        } catch (e: IOException) {
            // нет сети — последние данные и «Stand …»; данных ещё нет совсем — «Keine Verbindung», а не вечная загрузка
            if (store.data(key) == null) store.saveState(key, "offline")
        } finally {
            connection.disconnect()
        }
    }
}

/**
 * Фоновое обновление: так часто, как просит самый «нетерпеливый» виджет («Aktualisieren» 15/30/60 мин, часть 31d;
 * 15 минут — меньше Android не даёт), WorkManager сам ждёт сеть; и сразу по просьбе сайта или Android.
 */
class WidgetWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        WidgetSync.run(applicationContext)
        return Result.success()
    }

    companion object {
        private const val PERIODIC = "orbook-widget"
        private const val NOW = "orbook-widget-now"

        fun schedule(context: Context) {
            val store = WidgetStore(context)
            val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(ComponentName(context, OrbWidgetReceiver::class.java))
            // нет ни виджетов, ни уведомлений — фоновые запросы не нужны
            if (ids.isEmpty() && !Notifications.active(context)) { stop(context); return }
            val minutes = ids.toList().mapNotNull { id -> store.config(id)?.refresh }.minOrNull() ?: 30
            // Без условия «есть сеть» (часть 31e): без интернета задача всё равно перерисует виджеты
            // по сохранённым данным («Jetzt» идёт дальше), а загрузка тихо не удастся
            val request = PeriodicWorkRequestBuilder<WidgetWorker>(minutes.toLong(), TimeUnit.MINUTES).build()
            // UPDATE: новая частота сразу, без потери уже запланированного запуска
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(PERIODIC, ExistingPeriodicWorkPolicy.UPDATE, request)
        }

        fun refreshNow(context: Context) {
            WorkManager.getInstance(context).enqueueUniqueWork(NOW, ExistingWorkPolicy.REPLACE, OneTimeWorkRequestBuilder<WidgetWorker>().build())
        }

        fun stop(context: Context) = WorkManager.getInstance(context).cancelUniqueWork(PERIODIC)
    }
}
