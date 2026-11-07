import React from 'react';
import { MapPin, Phone, Sparkles, ShieldCheck, Truck, MessageCircle, Store } from 'lucide-react';

interface HomeHeroBannerProps {
  onOpenAddressModal?: () => void;
  onExploreOffers?: () => void;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({
  onOpenAddressModal,
  onExploreOffers,
}) => {
  const phoneNumber = '776662630';
  const displayPhone = '776 662 630';
  const whatsappUrl = `https://wa.me/967${phoneNumber}?text=${encodeURIComponent(
    'السلام عليكم، أود الاستفسار عن طلب خضار وفواكه وتمور من متجر الجمل'
  )}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-xl border border-emerald-700/60">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Main Hero Content */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center text-center">
        {/* Prominent Circular Official Store Emblem (from user's upload) */}
        <div className="relative group mb-3">
          {/* Subtle pulsating golden halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-emerald-300 to-amber-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1 shadow-2xl border-4 border-amber-300/80 overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
            <img
              src="/assets/aistudio/IMG_1918_6b43c639.PNG"
              alt="شعار الجمل للخضار والفواكه والتمور الرسمي"
              className="w-full h-full object-contain rounded-full select-none"
              loading="eager"
            />
          </div>

          {/* Freshness Badge floating */}
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border border-white flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 fill-stone-950" />
            <span>طازج يومياً</span>
          </div>
        </div>

        {/* Store Title & Slogan */}
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            الجمل للخضار والفواكه والتمور
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            أجود المحاصيل البلدي والمستوردة والتمور الفاخرة المقطوفة يومياً لباب بيتك
          </p>
        </div>

        {/* Verified Branch info */}
        <div className="mt-3.5 w-full max-w-sm">
          <div className="bg-emerald-950/70 border border-emerald-600/40 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-center gap-2 shadow-xs">
            <Store className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] font-black text-amber-300 block">
                المركز الرئيسي:
              </span>
              <span className="text-[11px] font-bold text-stone-100">
                صنعاء - حدة داخل التوفير هايبر
              </span>
            </div>
          </div>
        </div>

        {/* Action Hotline & WhatsApp Buttons */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 w-full max-w-md">
          <a
            href={`tel:${phoneNumber}`}
            className="flex-1 min-w-[140px] bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 fill-stone-950" />
            <span className="dir-ltr">{displayPhone}</span>
            <span className="text-[10px] bg-stone-950 text-amber-300 px-1 rounded font-bold">اتصال</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md border border-emerald-400/30 transition-all active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>طلب واتساب سريع</span>
          </a>

          {onOpenAddressModal && (
            <button
              onClick={onOpenAddressModal}
              className="bg-white/10 hover:bg-white/20 text-emerald-100 text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 border border-white/15 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>موقع التوصيل</span>
            </button>
          )}
        </div>

        {/* Feature Badges Strip */}
        <div className="mt-4 pt-3 border-t border-emerald-700/60 w-full grid grid-cols-3 gap-1.5 text-center text-[10px] text-emerald-100/90 font-medium">
          <div className="flex flex-col items-center gap-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>جودة وضمان طازج</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Truck className="w-3.5 h-3.5 text-emerald-300" />
            <span>توصيل سريع بصنعاء</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>محافظ إلكترونية معتمدة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
