import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onOpenDetails: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onOpenDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // fallback placeholder if remote image fails
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Origin / Quality Badge */}
        {product.badge && (
          <span className="absolute top-2 right-2 bg-emerald-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-stone-500 hover:text-red-500 transition-colors shadow-xs"
            aria-label="إضافة للمفضلة"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-600'
              }`}
            />
          </button>
        )}

        {/* Discount Badge if present */}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute bottom-2 right-2 bg-amber-500 text-stone-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
            وفر {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
        )}

        {/* Special Offer Badge if flagged */}
        {product.isSpecialOffer && (
          <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-amber-300">
            <span>🔥</span>
            <span>{product.offerDiscountText || 'عرض خاص'}</span>
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div className="cursor-pointer" onClick={() => onOpenDetails(product)}>
          {/* Rating & Origin */}
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
            <span className="truncate max-w-[65%] text-stone-500 font-medium">
              {product.origin}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>

          {/* Subtitle / Department */}
          <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
            {product.categoryLabel}
          </p>

          {/* Price display matching the screenshot "50 ر.ي/كجم" */}
          <div className="mt-2 mb-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-emerald-900 leading-none">
              {product.price} {currency}
            </span>
            <span className="text-[10px] text-stone-400 font-normal">
              /{product.unit}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-stone-400 line-through">
                {product.originalPrice} {currency}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Add to Cart OR Quantity Controller */}
        <div className="mt-auto pt-1">
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>أضف للسلة</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl px-1.5 py-1">
              <button
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-7 h-7 rounded-lg bg-white text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold hover:bg-stone-50 active:scale-95 transition-all"
                title="تقليل الكمية"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-xs text-emerald-950 px-2">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold hover:bg-emerald-900 active:scale-95 transition-all"
                title="زيادة الكمية"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
