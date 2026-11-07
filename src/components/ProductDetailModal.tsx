import React, { useState } from 'react';
import { Product } from '../types';
import {
  ChevronRight,
  ShoppingCart,
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  currency: string;
  onClose: () => void;
  onAddToCart: (product: Product, selectedWeight?: { label: string; multiplier: number }, qty?: number) => void;
  allProducts: Product[];
  cartCount: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  onClose,
  onAddToCart,
  allProducts,
  cartCount,
  onOpenCart,
  onSelectProduct,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(
    product.weightOptions[0] || { label: '1 كجم', multiplier: 1 }
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const unitPrice = Math.round(product.price * selectedWeight.multiplier);
  const totalPrice = unitPrice * quantity;

  // Filter related products from the same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    onAddToCart(product, selectedWeight, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center overflow-y-auto">
      <div className="bg-white w-full max-w-md max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Top Header Bar matching Screen 3 */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-white/95 backdrop-blur-xs sticky top-0 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1 font-bold text-xs"
          >
            <ChevronRight className="w-5 h-5 text-emerald-900" />
            <span>رجوع</span>
          </button>

          <h2 className="font-extrabold text-stone-900 text-sm truncate max-w-[200px]">
            {product.name}
          </h2>

          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="p-2 rounded-full hover:bg-emerald-50 text-emerald-900 relative transition-colors"
            title="عرض السلة"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto px-4 pb-28 pt-2 space-y-4">
          {/* Main Product Image Carousel */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 shadow-xs">
            <img
              src={images[activeImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {product.badge && (
                <span className="bg-emerald-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {product.badge}
                </span>
              )}
              {product.isOrganic && (
                <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  طبيعي 100%
                </span>
              )}
            </div>

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImageIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Title, Origin & Rating */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-lg font-black text-emerald-950">
                {product.name}
              </h1>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-xs text-amber-900">{product.rating}</span>
                <span className="text-[10px] text-stone-400">({product.reviewsCount})</span>
              </div>
            </div>

            <p className="text-xs text-emerald-800 font-semibold mt-1">
              {product.arabicName}
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
              <span className="flex items-center gap-1 font-medium">
                <span className="text-stone-400">بلد المنشأ:</span>
                <strong className="text-stone-700">{product.origin}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                متوفر بالمخزن
              </span>
            </div>
          </div>

          {/* Weight / Packaging Options matching Screen 3 buttons */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              اختر الوزن / العبوة المطلوبة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.weightOptions.map((opt, idx) => {
                const isSelected = selectedWeight.label === opt.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWeight(opt)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {Math.round(product.price * opt.multiplier)} {currency}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/70">
            <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              عن المنتج وجودته:
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quality Perks */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-200 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>توصيل سريع مبرد</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>ضمان الجودة والطزاجة 100%</span>
              </div>
            </div>
          </div>

          {/* Related Products matching Screen 3 */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-stone-900">
                  منتجات ذات صلة من نفس القسم
                </h4>
                <span className="text-[10px] text-emerald-800 font-bold">
                  {product.categoryLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setSelectedWeight(rel.weightOptions[0] || { label: '1 كجم', multiplier: 1 });
                      setActiveImageIndex(0);
                    }}
                    className="p-2 rounded-xl border border-stone-200/80 hover:border-emerald-500 bg-white cursor-pointer transition-all flex items-center gap-2 group"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {rel.name}
                      </p>
                      <p className="text-[11px] font-extrabold text-emerald-800">
                        {rel.price} {currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar matching Screen 3 */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-stone-200/90 p-3.5 shadow-lg flex items-center justify-between gap-3 z-30">
          {/* Quantity Selector */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl px-2 py-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-white text-stone-800 border border-stone-200 flex items-center justify-center font-bold hover:bg-stone-50 active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-stone-900 w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold hover:bg-emerald-900 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button with Price */}
          <button
            onClick={handleAdd}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm text-white flex items-center justify-between shadow-md active:scale-[0.99] transition-all cursor-pointer ${
              addedAnimation ? 'bg-amber-600' : 'bg-emerald-800 hover:bg-emerald-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              <span>{addedAnimation ? 'تمت الإضافة بنجاح!' : 'أضف للسلة'}</span>
            </div>
            <div className="text-amber-300 font-black">
              {totalPrice} {currency}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
