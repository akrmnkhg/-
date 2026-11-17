package com.example.ui.components

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import coil.compose.AsyncImage
import com.example.R

@Composable
fun MarketImage(
    imageUrl: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    val trimmed = imageUrl.trim()
    when {
        trimmed.startsWith("data:image", ignoreCase = true) && trimmed.contains("base64,") -> {
            val bitmap = remember(trimmed) {
                try {
                    val base64Part = trimmed.substringAfter("base64,")
                    val bytes = Base64.decode(base64Part, Base64.DEFAULT)
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                } catch (_: Exception) {
                    null
                }
            }
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = contentDescription,
                    modifier = modifier,
                    contentScale = contentScale
                )
            } else {
                Image(
                    painter = painterResource(id = R.drawable.img_hero_banner),
                    contentDescription = contentDescription,
                    modifier = modifier,
                    contentScale = contentScale
                )
            }
        }
        trimmed.startsWith("http://", ignoreCase = true) || trimmed.startsWith("https://", ignoreCase = true) -> {
            AsyncImage(
                model = trimmed,
                contentDescription = contentDescription,
                placeholder = painterResource(id = R.drawable.img_hero_banner),
                error = painterResource(id = R.drawable.img_hero_banner),
                modifier = modifier,
                contentScale = contentScale
            )
        }
        else -> {
            Image(
                painter = painterResource(id = R.drawable.img_hero_banner),
                contentDescription = contentDescription,
                modifier = modifier,
                contentScale = contentScale
            )
        }
    }
}
