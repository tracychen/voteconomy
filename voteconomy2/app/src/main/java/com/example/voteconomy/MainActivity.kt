package com.example.voteconomy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.ModalBottomSheetValue
import androidx.compose.material.rememberModalBottomSheetState
import androidx.navigation.NavDeepLink
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.voteconomy.ui.route.ChainSelectionRoute
import com.example.voteconomy.ui.route.PairingSelectionRoute
import com.example.voteconomy.ui.route.Route
import com.example.voteconomy.ui.route.SessionRoute
import com.google.accompanist.navigation.material.BottomSheetNavigator
import com.google.accompanist.navigation.material.ExperimentalMaterialNavigationApi
import com.google.accompanist.navigation.material.ModalBottomSheetLayout
import com.google.accompanist.navigation.material.bottomSheet
import com.walletconnect.wcmodal.ui.walletConnectModalGraph

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterialNavigationApi::class, ExperimentalMaterialApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val modalSheetState = rememberModalBottomSheetState(
                initialValue = ModalBottomSheetValue.Hidden, skipHalfExpanded = true)
            val bottomSheetNavigator = BottomSheetNavigator(modalSheetState)
            val navController = rememberNavController(bottomSheetNavigator)

            ModalBottomSheetLayout(bottomSheetNavigator = bottomSheetNavigator) {
                NavHost(
                    navController = navController,
                    startDestination = Route.ChainSelection.path
                ) {

                    composable(Route.ChainSelection.path) {
                        ChainSelectionRoute(navController)
                    }
                    bottomSheet(Route.ParingSelection.path) {
                        PairingSelectionRoute(navController)
                    }
                    composable(Route.Session.path, deepLinks = listOf(NavDeepLink("kotlin-dapp-wc://request"))) {
                        SessionRoute(navController)
                    }
                    walletConnectModalGraph(navController)
                }

            }

        }
    }
}


