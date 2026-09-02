package com.erenlermarket.app.ui.navigation

import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.erenlermarket.app.R
import com.erenlermarket.app.ui.auth.AuthScreen
import com.erenlermarket.app.ui.categories.CategoriesScreen
import com.erenlermarket.app.ui.home.HomeScreen
import com.erenlermarket.app.ui.productdetail.ProductDetailScreen
import com.erenlermarket.app.ui.productlist.ProductListScreen
import com.erenlermarket.app.ui.profile.ProfileScreen

private enum class TopDestination(
    val route: String,
    @StringRes val labelRes: Int,
    val icon: ImageVector,
) {
    HOME(Routes.HOME, R.string.tab_home, Icons.Filled.Home),
    STORE(Routes.STORE, R.string.tab_store, Icons.Filled.Storefront),
    CATEGORIES(Routes.CATEGORIES, R.string.tab_categories, Icons.Filled.GridView),
}

@Composable
fun RootScreen() {
    // Oturumu açılışta geri yükler (init içinde restore çağırır).
    hiltViewModel<RootViewModel>()

    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    val toProduct = { id: String, name: String -> navController.navigate(Routes.product(id, name)) }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(visible = currentRoute in Routes.topLevel) {
                NavigationBar {
                    TopDestination.entries.forEach { destination ->
                        NavigationBarItem(
                            selected = currentRoute == destination.route,
                            onClick = {
                                navController.navigate(destination.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(destination.icon, contentDescription = null) },
                            label = { Text(stringResource(destination.labelRes)) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onProduct = toProduct,
                    onAccount = { navController.navigate(Routes.PROFILE) },
                    onRailSeeAll = { rail ->
                        navController.navigate(
                            Routes.productList(
                                title = rail.title,
                                onlyDiscounted = rail.onlyDiscounted,
                                onlyNew = rail.onlyNew,
                            ),
                        )
                    },
                )
            }
            composable(Routes.STORE) {
                ProductListScreen(onProduct = toProduct, onBack = null)
            }
            composable(Routes.CATEGORIES) {
                CategoriesScreen(
                    onCategory = { id, name ->
                        navController.navigate(Routes.productList(title = name, categoryId = id))
                    },
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    onBack = navController::popBackStack,
                    onSignIn = { navController.navigate(Routes.AUTH) },
                )
            }
            composable(Routes.AUTH) {
                AuthScreen(
                    onBack = navController::popBackStack,
                    onAuthenticated = navController::popBackStack,
                )
            }
            composable(
                route = Routes.PRODUCT,
                arguments = listOf(
                    navArgument("productId") { type = NavType.StringType },
                    navArgument("name") { type = NavType.StringType; defaultValue = "" },
                ),
            ) {
                ProductDetailScreen(
                    onBack = navController::popBackStack,
                    onProduct = toProduct,
                )
            }
            composable(
                route = Routes.PRODUCT_LIST,
                arguments = listOf(
                    navArgument("title") { type = NavType.StringType; defaultValue = "Ürünler" },
                    navArgument("categoryId") {
                        type = NavType.StringType; nullable = true; defaultValue = null
                    },
                    navArgument("onlyDiscounted") { type = NavType.BoolType; defaultValue = false },
                    navArgument("onlyNew") { type = NavType.BoolType; defaultValue = false },
                ),
            ) {
                ProductListScreen(onProduct = toProduct, onBack = navController::popBackStack)
            }
        }
    }
}
