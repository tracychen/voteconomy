package com.example.voteconomy.ui.data

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

data class PairingSelectionUi(
    val name: String,
    val iconUrl: String?
)

const val pairingSelectionResultKey = "pairingSelectionResultKey"

sealed class PairingSelectionResult : Parcelable {
    @Parcelize object None : PairingSelectionResult()
    @Parcelize object NewPairing : PairingSelectionResult()
    @Parcelize data class SelectedPairing(val position: Int) : PairingSelectionResult()
}