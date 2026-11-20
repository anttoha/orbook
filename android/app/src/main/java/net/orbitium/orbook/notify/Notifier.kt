package net.orbitium.orbook.notify

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import net.orbitium.orbook.MainActivity
import net.orbitium.orbook.R
import net.orbitium.orbook.Site
import net.orbitium.orbook.widget.Texts

/**
 * Часть 31e. Показ уведомлений: каналы (их видно в настройках Android — можно выключить по отдельности):
 * «Plan und Tests» и «Vor der Stunde» (и «Noten», часть 36c). Нажатие открывает нужную страницу сайта в приложении.
 */
object Notifier {
    const val PLAN = "plan"
    const val LESSON = "lesson"
    const val NOTEN = "noten" // часть 36c

    /** granted — можно; denied — запрещено (нужны настройки Android); ask — ещё не спрашивали. */
    fun permission(context: Context): String {
        val enabled = NotificationManagerCompat.from(context).areNotificationsEnabled()
        if (Build.VERSION.SDK_INT < 33) return if (enabled) "granted" else "denied"
        val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        return when {
            granted && enabled -> "granted"
            granted || NotifySettings.asked(context) -> "denied"
            else -> "ask"
        }
    }

    private fun channels(context: Context, texts: Texts) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(PLAN, texts.t("Plan und Tests"), NotificationManager.IMPORTANCE_DEFAULT))
        manager.createNotificationChannel(NotificationChannel(LESSON, texts.t("Vor der Stunde"), NotificationManager.IMPORTANCE_HIGH))
        manager.createNotificationChannel(NotificationChannel(NOTEN, texts.t("Noten"), NotificationManager.IMPORTANCE_DEFAULT))
    }

    fun post(context: Context, note: Note, channel: String, texts: Texts) {
        if (permission(context) != "granted") return
        channels(context, texts)
        val open = Intent(context, MainActivity::class.java).setData(Uri.parse(Site.url(note.path)))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val tap = PendingIntent.getActivity(context, note.id.hashCode(), open, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        // несколько строк (вечернее «Morgen: …»): заголовок — «Morgen», текст — строки; одна строка — заголовок «ORBook»
        val multi = note.text.contains("\n")
        val title = if (multi) note.text.substringBefore(": ") else "ORBook"
        val body = if (multi) note.text.substringAfter(": ") else note.text
        val notification = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_notify)
            .setColor(ContextCompat.getColor(context, R.color.accent))
            .setContentTitle(title)
            .setContentText(body.replace("\n", " · "))
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(tap)
            .setAutoCancel(true)
            .setCategory(if (channel == LESSON) NotificationCompat.CATEGORY_REMINDER else NotificationCompat.CATEGORY_EVENT)
            .build()
        try {
            NotificationManagerCompat.from(context).notify(note.id.hashCode(), notification)
        } catch (e: SecurityException) {
            // разрешение забрали прямо сейчас — молча пропускаем
        }
    }
}
