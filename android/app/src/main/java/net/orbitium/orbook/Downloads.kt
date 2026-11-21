package net.orbitium.orbook

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.provider.MediaStore
import android.util.Base64

/**
 * Часть 37: сохранить файл (PDF «Als PDF») в «Downloads» телефона. В WebView загрузка blob: не работает,
 * поэтому сайт отдаёт файл приложению через мост. Android 10+ — без разрешений (MediaStore);
 * на Android 8–9 нужен доступ к памяти — там не сохраняем (сайт покажет ошибку).
 */
object Downloads {
    fun save(context: Context, name: String, mime: String, base64: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        val bytes = runCatching { Base64.decode(base64, Base64.DEFAULT) }.getOrNull() ?: return false
        val safeName = name.replace(Regex("[^A-Za-z0-9._-]"), "_").take(80).ifEmpty { "ORBook.pdf" }
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, safeName)
            put(MediaStore.Downloads.MIME_TYPE, mime)
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return false
        return try {
            resolver.openOutputStream(uri)?.use { it.write(bytes) } ?: return false
            values.clear()
            values.put(MediaStore.Downloads.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
            true
        } catch (e: Exception) {
            resolver.delete(uri, null, null)
            false
        }
    }
}
