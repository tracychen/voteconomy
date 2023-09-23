package com.example.voteconomy

import android.app.Application
import com.walletconnect.android.Core
import com.walletconnect.android.CoreClient
import com.walletconnect.android.relay.ConnectionType
import com.walletconnect.wcmodal.client.Modal
import com.walletconnect.wcmodal.client.WalletConnectModal
import timber.log.Timber

class MainApp: Application() {
    override fun onCreate() {
        super.onCreate()

        val projectId = "c85cc6e93bd4e8c4f442ccd04a12a0ef"

        val serverUri = "wss://relay.walletconnect.com?projectId=$projectId"
        val appMetaData = Core.Model.AppMetaData(
            name = "Kotlin Dapp",
            description = "Kotlin Dapp Implementation",
            url = "kotlin.walletconnect.com",
            icons = listOf("https://gblobscdn.gitbook.com/spaces%2F-LJJeCjcLrr53DcT1Ml7%2Favatar.png?alt=media"),
            redirect = "kotlin-modal://request"
        )

        CoreClient.initialize(
            relayServerUrl = serverUri,
            connectionType = ConnectionType.AUTOMATIC,
            application = this,
            metaData = appMetaData,
        ) {error ->
            Timber.e(tag(this), error.throwable.stackTraceToString())
        }

        WalletConnectModal.initialize(
            Modal.Params.Init(core = CoreClient)
        ) { error ->
            Timber.e(tag(this), error.throwable.stackTraceToString())
        }
    }
}

inline fun <reified T : Any> tag(currentClass: T): String {
    return ("Wallet" + currentClass::class.java.canonicalName!!.substringAfterLast(".")).take(23)
}
