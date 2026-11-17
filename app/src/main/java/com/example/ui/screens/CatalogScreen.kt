package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.Product
import com.example.data.UiState
import com.example.ui.viewmodel.FreshMarketViewModel

@Composable
fun CatalogScreen(
    viewModel: FreshMarketViewModel,
    onProductClick: (Product) -> Unit
) {
    val productsState by viewModel.productsState.collectAsStateWithLifecycle()
    val categoriesState by viewModel.categoriesState.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val favoriteIds by viewModel.favoriteIdsState.collectAsStateWithLifecycle()

    val products = (productsState as? UiState.Success)?.data ?: emptyList()
    val dynamicCategories = (categoriesState as? UiState.Success)?.data ?: emptyList()

    val categories = remember(dynamicCategories, products) {
        val fromCategories = dynamicCategories.map { it.name }.filter { it.isNotBlank() }
        val fromProducts = products.map { it.category }.filter { it.isNotBlank() }
        listOf("All") + (fromCategories + fromProducts).distinct()
    }

    val filtered = remember(products, selectedCategory) {
        products.filter {
            selectedCategory == "All" || it.category.equals(selectedCategory, ignoreCase = true)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Explore Catalog",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(12.dp))

        ScrollableTabRow(
            selectedTabIndex = categories.indexOf(selectedCategory).coerceAtLeast(0),
            edgePadding = 0.dp,
            containerColor = MaterialTheme.colorScheme.background
        ) {
            categories.forEach { category ->
                Tab(
                    selected = category == selectedCategory,
                    onClick = { viewModel.selectCategory(category) },
                    text = { Text(category) },
                    modifier = Modifier.testTag("catalog_tab_$category")
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (val state = productsState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is UiState.Error -> {
                Text(text = state.message, color = MaterialTheme.colorScheme.error)
            }
            is UiState.Success -> {
                if (filtered.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "No items in this category yet.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                        )
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                    ) {
                        items(filtered, key = { it.id }) { product ->
                            ProductCard(
                                product = product,
                                isFavorite = favoriteIds.contains(product.id),
                                onFavoriteClick = { viewModel.toggleFavorite(product.id) },
                                onAddToCart = { viewModel.addToCart(product) },
                                onClick = { onProductClick(product) }
                            )
                        }
                    }
                }
            }
        }
    }
}
