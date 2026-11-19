package net.orbitium.orbook

import android.net.Uri

/** Наш сайт: прод или демо — задаёт вариант сборки (build.gradle.kts → SITE_URL). */
object Site {
    private val base: Uri = Uri.parse(BuildConfig.SITE_URL)

    fun url(path: String): String = BuildConfig.SITE_URL + path

    /** Свой ли адрес: только он открывается внутри приложения и получает мост. */
    fun isOwn(uri: Uri?): Boolean = uri != null && uri.scheme == "https" && uri.host == base.host
}
