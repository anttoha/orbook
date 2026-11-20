package net.orbitium.orbook.noten

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Часть 36c: что приложение помнит о Noten — только с «Angemeldet bleiben»:
 * адрес InfoPoint, имя, пароль, последние оценки и какие оценки уже показаны («seen»).
 * Имя, пароль и оценки зашифрованы ключом из Android Keystore: ключ не покидает телефон,
 * а файл из резервной копии исключён (res/xml/backup_rules.xml) — без ключа он всё равно бесполезен.
 */
class NotenStore(context: Context) {
    private val prefs = context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    /** Сохранённый логин: url — null, если берём оценки через сервер ORBook (демо). */
    data class Login(val url: String?, val username: String, val password: String)

    fun login(): Login? {
        val username = read("username") ?: return null
        val password = read("password") ?: return null
        return Login(prefs.getString("url", null), username, password)
    }

    fun saveLogin(login: Login) = prefs.edit()
        .putString("url", login.url)
        .putString("username", seal(login.username))
        .putString("password", seal(login.password))
        .apply()

    /** Пароль больше не подходит: имя оставляем, пароль стираем — фон больше не стучится. */
    fun forgetPassword() = prefs.edit().remove("password").apply()

    fun username(): String? = read("username")

    /** Последний ответ (тот же JSON, что у сервера) и когда он получен. */
    fun data(): String? = read("data")
    fun fetchedAt(): Long = prefs.getLong("fetchedAt", 0)
    fun saveData(json: String, at: Long) = prefs.edit().putString("data", seal(json)).putLong("fetchedAt", at).apply()

    /** Ключи оценок, о которых уже знаем (gradeKey, как в src/shared/utils/noten.js). null — ещё ни разу. */
    fun seen(): Set<String>? = read("seen")?.split('\n')?.filter { it.isNotEmpty() }?.toSet()
    fun saveSeen(keys: Set<String>) = prefs.edit().putString("seen", seal(keys.joinToString("\n"))).apply()

    // Лимиты (как на сервере): когда была удачная загрузка и последние попытки
    fun lastOk(): Long = prefs.getLong("lastOk", 0)
    fun markOk(at: Long) = prefs.edit().putLong("lastOk", at).apply()
    fun tries(): List<Long> = prefs.getString("tries", "")!!.split(',').mapNotNull { it.toLongOrNull() }
    fun saveTries(list: List<Long>) = prefs.edit().putString("tries", list.joinToString(",")).apply()

    /** «Abmelden»: всё, кроме лимитов (иначе выход-вход обходил бы их). */
    fun clear() = prefs.edit().remove("url").remove("username").remove("password").remove("data").remove("fetchedAt").remove("seen").apply()

    private fun read(name: String): String? = prefs.getString(name, null)?.let(::open)

    // ── шифрование: AES-GCM, ключ в Android Keystore ──

    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.let { return it.secretKey }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build(),
        )
        return generator.generateKey()
    }

    private fun seal(text: String): String {
        val cipher = Cipher.getInstance(AES)
        cipher.init(Cipher.ENCRYPT_MODE, key())
        return Base64.encodeToString(cipher.iv + cipher.doFinal(text.toByteArray()), Base64.NO_WRAP)
    }

    /** Не расшифровывается (ключ пропал, файл чужой) — считаем, что ничего нет. */
    private fun open(sealed: String): String? = runCatching {
        val bytes = Base64.decode(sealed, Base64.NO_WRAP)
        val cipher = Cipher.getInstance(AES)
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, bytes, 0, IV))
        String(cipher.doFinal(bytes, IV, bytes.size - IV))
    }.getOrNull()

    companion object {
        const val FILE = "orbook-noten"
        private const val ALIAS = "orbook-noten"
        private const val AES = "AES/GCM/NoPadding"
        private const val IV = 12
    }
}
