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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.delay
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
import com.erenlermarket.app.ui.admin.AdminConversationScreen
import com.erenlermarket.app.ui.admin.AdminHomeScreen
import com.erenlermarket.app.ui.admin.AdminLowStockScreen
import com.erenlermarket.app.ui.admin.AdminMessagesScreen
import com.erenlermarket.app.ui.admin.AdminOrderDetailScreen
import com.erenlermarket.app.ui.admin.AdminOrdersScreen
import com.erenlermarket.app.ui.auth.AuthScreen
import com.erenlermarket.app.ui.cart.CartScreen
import com.erenlermarket.app.ui.categories.CategoriesScreen
import com.erenlermarket.app.ui.checkout.CheckoutScreen
import com.erenlermarket.app.ui.checkout.OrderPlacedScreen
import com.erenlermarket.app.ui.home.HomeScreen
import com.erenlermarket.app.ui.messages.MessagesScreen
import com.erenlermarket.app.ui.notifications.NotificationsScreen
import com.erenlermarket.app.ui.orders.OrderDetailScreen
import com.erenlermarket.app.ui.orders.OrdersScreen
import com.erenlermarket.app.ui.productdetail.ProductDetailScreen
import com.erenlermarket.app.ui.productlist.ProductListScreen
import com.erenlermarket.app.ui.profile.ProfileScreen
import com.erenlermarket.app.ui.settings.AboutScreen
import com.erenlermarket.app.ui.settings.EditProfileScreen
import com.erenlermarket.app.ui.settings.SettingsScreen
import com.erenlermarket.app.ui.wishlist.WishlistScreen

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
    val rootViewModel = hiltViewModel<RootViewModel>()

    // Uygulama ön plandayken bildirimleri periyodik yokla — sipariş durumu
    // değişince zil rozeti kendiliğinden güncellensin. Arka planda durur.
    val lifecycleOwner = LocalLifecycleOwner.current
    LaunchedEffect(Unit) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            while (true) {
                rootViewModel.pollNotifications()
                delay(NOTIFICATIONS_POLL_INTERVAL_MS)
            }
        }
    }

    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    val toProduct = { id: String, name: String -> navController.navigate(Routes.product(id, name)) }
    val toCart = { navController.navigate(Routes.CART) }
    val toAuth = { navController.navigate(Routes.AUTH) }

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
                    onCart = toCart,
                    onNotifications = { navController.navigate(Routes.NOTIFICATIONS) },
                    onMessages = { navController.navigate(Routes.MESSAGES) },
                    onOrder = { navController.navigate(Routes.orderDetail(it)) },
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
                ProductListScreen(onProduct = toProduct, onBack = null, onCart = toCart)
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
                    onSignIn = toAuth,
                    onOrders = { navController.navigate(Routes.ORDERS) },
                    onWishlist = { navController.navigate(Routes.WISHLIST) },
                    onSettings = { navController.navigate(Routes.SETTINGS) },
                    onAdmin = { navController.navigate(Routes.ADMIN) },
                )
            }
            composable(Routes.AUTH) {
                AuthScreen(
                    onBack = navController::popBackStack,
                    onAuthenticated = navController::popBackStack,
                )
            }
            composable(Routes.CART) {
                CartScreen(
                    onBack = navController::popBackStack,
                    onCheckout = { navController.navigate(Routes.CHECKOUT) },
                    onSignIn = toAuth,
                )
            }
            composable(Routes.CHECKOUT) {
                CheckoutScreen(
                    onBack = navController::popBackStack,
                    onOrderPlaced = { orderId ->
                        navController.navigate(Routes.orderPlaced(orderId)) {
                            popUpTo(Routes.HOME)
                        }
                    },
                )
            }
            composable(
                route = Routes.ORDER_PLACED,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
            ) { entry ->
                val orderId = entry.arguments?.getString("orderId").orEmpty()
                OrderPlacedScreen(
                    onViewOrder = {
                        navController.navigate(Routes.orderDetail(orderId)) {
                            popUpTo(Routes.HOME)
                        }
                    },
                    onContinueShopping = { navController.popBackStack(Routes.HOME, inclusive = false) },
                )
            }
            composable(Routes.ORDERS) {
                OrdersScreen(
                    onBack = navController::popBackStack,
                    onOrder = { navController.navigate(Routes.orderDetail(it)) },
                )
            }
            composable(
                route = Routes.ORDER_DETAIL,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
            ) {
                OrderDetailScreen(onBack = navController::popBackStack)
            }
            composable(Routes.WISHLIST) {
                WishlistScreen(onBack = navController::popBackStack, onProduct = toProduct)
            }
            composable(Routes.MESSAGES) {
                MessagesScreen(onBack = navController::popBackStack)
            }
            composable(Routes.NOTIFICATIONS) {
                NotificationsScreen(
                    onBack = navController::popBackStack,
                    onOrder = { navController.navigate(Routes.orderDetail(it)) },
                )
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    onBack = navController::popBackStack,
                    onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                    onAbout = { navController.navigate(Routes.ABOUT) },
                    onAccountDeleted = {
                        navController.popBackStack(Routes.HOME, inclusive = false)
                    },
                )
            }
            composable(Routes.EDIT_PROFILE) {
                EditProfileScreen(onBack = navController::popBackStack)
            }

            // --- Admin ---
            composable(Routes.ADMIN) {
                AdminHomeScreen(
                    onBack = navController::popBackStack,
                    onOrders = { navController.navigate(Routes.ADMIN_ORDERS) },
                    onMessages = { navController.navigate(Routes.ADMIN_MESSAGES) },
                    onLowStock = { navController.navigate(Routes.ADMIN_LOW_STOCK) },
                )
            }
            composable(Routes.ADMIN_ORDERS) {
                AdminOrdersScreen(
                    onBack = navController::popBackStack,
                    onOrder = { navController.navigate(Routes.adminOrderDetail(it)) },
                )
            }
            composable(
                route = Routes.ADMIN_ORDER_DETAIL,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
            ) {
                AdminOrderDetailScreen(onBack = navController::popBackStack)
            }
            composable(Routes.ADMIN_MESSAGES) {
                AdminMessagesScreen(
                    onBack = navController::popBackStack,
                    onConversation = { id, name ->
                        navController.navigate(Routes.adminConversation(id, name))
                    },
                )
            }
            composable(
                route = Routes.ADMIN_CONVERSATION,
                arguments = listOf(
                    navArgument("conversationId") { type = NavType.StringType },
                    navArgument("name") { type = NavType.StringType; defaultValue = "" },
                ),
            ) {
                AdminConversationScreen(onBack = navController::popBackStack)
            }
            composable(Routes.ADMIN_LOW_STOCK) {
                AdminLowStockScreen(onBack = navController::popBackStack)
            }
            composable(Routes.ABOUT) {
                AboutScreen(onBack = navController::popBackStack)
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
