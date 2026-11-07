import React from 'react';
import { Offer, Product } from '../types';
import { Sparkles, ArrowLeft, Clock, ShoppingCart, Percent } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OffersViewProps {
  offers: Offer[];
  products: Product[];
  currency: string;
  onAddToCart: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  offers,
  products,
  currency,
  onAddToCart,
  onOpenProduct,
}) => {
  return (
    <div className="space-y-4 pb-28">
      {/* Top Title matching Screen 6 */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">عروض حصرية</h2>
          <p className="text-[11px] text-stone-500">
            توفير أسبوعي على التمور والخضار والفواكه الطازجة
          </p>
        </div>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          توفير حتى 30%
        </span>
      </div>

      {/* Hero Banner with Brand Emblem matching Screen 6 top banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-900 p-5 text-white shadow-md">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-2 max-w-[65%]">
            <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              عرض خاص
            </span>
            <h3 className="text-lg sm:text-xl font-black leading-tight">
              أجود محاصيل اليمن والمستورد لباب بيتك
            </h3>
            <p className="text-xs text-emerald-100 opacity-90">
              استمتع بتمور فاخرة وخضار بلدي مقطوفة يومياً مع خصومات تصل إلى 25%
            </p>
          </div>

          {/* Centered Brand Emblem in glowing ring */}
          <div className="bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-xs shrink-0">
            <BrandLogo size="md" showSubtitle={false} />
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Offer Cards matching Screen 6 Cards */}
      <div className="space-y-4">
        {offers.map((offer) => {
          const bundleProducts = products.filter((p) =>
            offer.bundleProductIds.includes(p.id)
          );

          const savingAmount =
            offer.oldPrice && offer.offerPrice && offer.oldPrice > offer.offerPrice
              ? offer.oldPrice - offer.offerPrice
              : 0;

          return (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              {/* Card Banner Image */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-900">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

                {/* Offer Badges */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="bg-amber-500 text-stone-950 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                    {offer.badge}
                  </span>
                  <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {offer.tag}
                  </span>
                </div>

                {/* Studio Photos Count Badge */}
                {offer.gallery && offer.gallery.length > 1 && (
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300/30">
                    📷 {offer.gallery.length} صور من الاستديو
                  </div>
                )}

                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{offer.expiryDate}</span>
                  </div>
                  <h4 className="font-black text-sm sm:text-base leading-snug">
                    {offer.title}
                  </h4>
                </div>
              </div>

              {/* Studio Gallery Photos Strip (if multiple photos attached from studio) */}
              {offer.gallery && offer.gallery.length > 1 && (
                <div className="px-4 pt-2.5 bg-stone-50 border-b border-stone-200/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-[10px] font-bold text-stone-500 shrink-0">
                    معرض صور العرض:
                  </span>
                  {offer.gallery.map((gImg, gIdx) => (
                    <img
                      key={gIdx}
                      src={gImg}
                      alt={`صورة ${gIdx + 1}`}
                      className={`w-10 h-10 rounded-lg object-cover border shrink-0 ${
                        offer.image === gImg
                          ? 'border-amber-500 ring-2 ring-amber-300'
                          : 'border-stone-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Offer Description & Pricing & CTA matching Screen 6 */}
              <div className="p-4 bg-stone-50/50 space-y-3">
                <p className="text-xs text-stone-700 leading-relaxed">
                  {offer.description}
                </p>

                {/* Pricing & Savings Box */}
                {(offer.offerPrice !== undefined || offer.oldPrice !== undefined) && (
                  <div className="bg-white rounded-2xl p-3 border border-stone-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block">
                        سعر العرض الخاص:
                      </span>
                      <div className="flex items-baseline gap-2">
                        {offer.offerPrice !== undefined && (
                          <span className="text-lg font-black text-emerald-800">
                            {offer.offerPrice} {currency}
                          </span>
                        )}
                        {offer.oldPrice !== undefined && (
                          <span className="text-xs text-stone-400 line-through font-bold">
                            {offer.oldPrice} {currency}
                          </span>
                        )}
                        {offer.unit && (
                          <span className="text-[11px] text-stone-500 font-bold">
                            / {offer.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {savingAmount > 0 && (
                      <div className="text-left bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        <span className="text-[10px] font-black text-emerald-800 block">
                          وفر {savingAmount} {currency}
                        </span>
                        {offer.discountPercentage && (
                          <span className="text-[9.5px] font-bold text-emerald-600">
                            خصم {offer.discountPercentage}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bundle items mini preview */}
                {bundleProducts.length > 0 && (
                  <div className="pt-2 border-t border-stone-200">
                    <div className="text-[10px] font-bold text-stone-500 mb-1.5">
                      يشمل العرض هذه المنتجات الطازجة:
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {bundleProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onOpenProduct(p)}
                          className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1.5 shrink-0 cursor-pointer hover:border-emerald-600 transition-colors"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="text-[11px] font-bold text-stone-800">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button "تسوق العرض الآن" */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {offer.code && (
                    <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                      <span>الكوبون:</span>
                      <strong className="text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {offer.code}
                      </strong>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (bundleProducts.length > 0) {
                        bundleProducts.forEach((bp) => onAddToCart(bp));
                      } else if (products.length > 0) {
                        onAddToCart(products[0]);
                      }
                    }}
                    className="mr-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-xs py-2 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>تسوق العرض الآن</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
