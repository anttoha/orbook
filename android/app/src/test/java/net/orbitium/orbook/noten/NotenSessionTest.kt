package net.orbitium.orbook.noten

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.CountDownLatch
import kotlin.concurrent.thread

class NotenSessionTest {
    @Test
    fun antwortNachAbmeldenWirdNichtGespeichert() {
        val session = NotenSession()
        var stored: String? = "alt"
        val asked = session.current()
        val logout = CountDownLatch(1)
        var written = true
        // «Anfrage», die erst nach dem Abmelden fertig wird
        val request = thread {
            logout.await()
            written = session.ifSame(asked) { stored = "neu" }
        }
        session.end { stored = null }
        logout.countDown()
        request.join()
        assertFalse(written)
        assertEquals(null, stored)
    }

    @Test
    fun ohneAbmeldenWirdGespeichert() {
        val session = NotenSession()
        var stored: String? = null
        assertTrue(session.ifSame(session.current()) { stored = "neu" })
        assertEquals("neu", stored)
    }
}
