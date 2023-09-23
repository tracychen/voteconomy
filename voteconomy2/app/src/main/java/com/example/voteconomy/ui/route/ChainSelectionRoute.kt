package com.example.voteconomy.ui.route

import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.voteconomy.ui.BlueButton
import com.example.voteconomy.ui.WCTopAppBar
import com.example.voteconomy.ui.coloredShadow
import com.example.voteconomy.ui.conditionalModifier
import com.example.voteconomy.ui.data.ChainSelectionUi
import com.example.voteconomy.ui.data.Chains
import com.example.voteconomy.ui.data.DappSampleEvents
import com.example.voteconomy.ui.data.PairingSelectionResult
import com.example.voteconomy.ui.data.pairingSelectionResultKey
import com.example.voteconomy.ui.data.toChainUiState
import com.example.voteconomy.ui.toColor
import com.example.voteconomy.ui.viewmodel.ChainSelectionViewModel
import com.walletconnect.android.utils.isPackageInstalled
import com.walletconnect.wcmodal.client.WalletConnectModal
import com.walletconnect.wcmodal.ui.openWalletConnectModal
import com.walletconnect.wcmodal.ui.state.rememberModalState
import kotlinx.coroutines.flow.collectLatest

@Composable
fun ChainSelectionRoute(navController: NavController) {
    val context = LocalContext.current
    val viewModel: ChainSelectionViewModel = viewModel()
    val chainsState by viewModel.uiState.collectAsState()
    val isModalState = rememberModalState(navController = navController)
    val isOpen by isModalState.isOpenFlow.collectAsState(initial = isModalState.isOpen)

    LaunchedEffect(Unit) {
        navController.currentBackStackEntryFlow.collectLatest { event ->
            event.savedStateHandle.get<PairingSelectionResult>(
                pairingSelectionResultKey
            )?.let {
                navController.currentBackStackEntry?.savedStateHandle?.remove<PairingSelectionResult>(pairingSelectionResultKey)
                when(it) {
                    PairingSelectionResult.NewPairing -> {
                        WalletConnectModal.setSessionParams(viewModel.getSessionParams())
                        navController.openWalletConnectModal()
                    }
                    PairingSelectionResult.None -> Unit
                    is PairingSelectionResult.SelectedPairing -> viewModel.connectToWallet(it.position)
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        viewModel.walletEvents.collect { event ->
            when(event) {
                DappSampleEvents.SessionApproved -> navController.navigate(Route.Session.path)
                else -> Unit
            }
        }
    }

    ChainSelectionScreen(
        chains = chainsState,
        isSampleWalletInstalled = context.isSampleWalletInstalled(),
        onChainClick = viewModel::updateChainSelectState,
        onConnectClick = {
            if (viewModel.isAnyChainSelected) {
                if (viewModel.isAnySettledParingExist) {
                    navController.navigate(Route.ParingSelection.path) {
                        popUpTo(Route.ChainSelection.path)
                    }
                } else {
                    WalletConnectModal.setSessionParams(viewModel.getSessionParams())
                    navController.openWalletConnectModal()
                }
            } else {
                Toast.makeText(context, "Please select a chain", Toast.LENGTH_SHORT).show()
            }
        },
        onConnectSampleWalletClick = {
            if (viewModel.isAnyChainSelected) {
                viewModel.connectToWallet { uri ->
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        data = uri.replace("wc:", "wc://").toUri()
                        `package` = PACKAGE
                    }
                    context.startActivity(intent)
                }
            } else {
                Toast.makeText(context, "Please select a chain", Toast.LENGTH_SHORT).show()
            }
        }
    )
}

@Composable
private fun ChainSelectionScreen(
    chains: List<ChainSelectionUi>,
    isSampleWalletInstalled: Boolean,
    onChainClick: (Int, Boolean) -> Unit,
    onConnectClick: () -> Unit,
    onConnectSampleWalletClick: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        WCTopAppBar(titleText = "Chain selection")
        ChainsList(
            chains = chains,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            onChainClick,
        )
        BlueButton(
            text = "Connect via WalletConnect Modal",
            onClick = onConnectClick,
            modifier = Modifier
                .padding(vertical = 10.dp)
                .fillMaxWidth()
                .height(50.dp)
                .padding(horizontal = 16.dp),
        )
        if (isSampleWalletInstalled) {
            WalletConnectSampleButton(onConnectSampleWalletClick)
        }
    }
}

@Composable
private fun WalletConnectSampleButton(onClick: () -> Unit) {
    BlueButton(
        text = "Connect via Wallet Sample",
        onClick = onClick,
        modifier = Modifier
            .padding(vertical = 10.dp)
            .fillMaxWidth()
            .height(50.dp)
            .padding(horizontal = 16.dp)
    )
}

@Composable
private fun ChainsList(
    chains: List<ChainSelectionUi>,
    modifier: Modifier,
    onChainClick: (Int, Boolean) -> Unit
) {
    LazyColumn(modifier = modifier) {
        itemsIndexed(chains) { index, chain ->
            ChainItem(
                index = index,
                chain = chain,
                onChainClick = onChainClick
            )
        }
    }
}

@Composable
private fun ChainItem(
    index: Int,
    chain: ChainSelectionUi,
    onChainClick: (Int, Boolean) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp, horizontal = 4.dp)
            .clickable {
                onChainClick(index, chain.isSelected)
            }
            .conditionalModifier(chain.isSelected) {
                Modifier.coloredShadow(
                    chain.color.toColor(),
                    borderRadius = 8.dp,
                    blurRadius = 8.dp,
                    spread = 2f
                )
            }
            .border(width = 1.dp, color = chain.color.toColor(), shape = RoundedCornerShape(8.dp))
            .background(color = MaterialTheme.colors.background, shape = RoundedCornerShape(8.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            imageVector = ImageVector.vectorResource(id = chain.icon),
            contentDescription = "${chain.chainName} icon"
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(text = chain.chainName)
    }
}


private class ChainSelectionStateProvider : PreviewParameterProvider<List<ChainSelectionUi>> {
    override val values: Sequence<List<ChainSelectionUi>>
        get() = sequenceOf(
            Chains.values().map { it.toChainUiState() }
        )
}

private const val PACKAGE = "com.example.voteconomy.ui.route"
private fun Context.isSampleWalletInstalled() = packageManager.isPackageInstalled(PACKAGE)
