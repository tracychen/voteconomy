package com.example.voteconomy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.voteconomy.ui.data.PairingSelectionUi
import com.walletconnect.android.CoreClient
import kotlinx.coroutines.flow.*

class PairingSelectionViewModel : ViewModel() {
    val state = flowOf(CoreClient.Pairing.getPairings())
        .map { it.mapNotNull { pairing -> pairing.peerAppMetaData } }
        .map { it.map { metaData -> PairingSelectionUi(metaData.name, metaData.icons.firstOrNull()) } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(), emptyList())
}