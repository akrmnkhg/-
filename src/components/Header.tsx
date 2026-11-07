import React from 'react';
import { Search, MapPin, PhoneCall, X, ChevronDown, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DeliveryAddress } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAddress: DeliveryAddress;
  onOpenAddressModal: () => void;
  currency: string;
  onToggleCurrency: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedAddress,
  onOpenAddressModal,
  currency,
  onToggleCurrency,
  onOpenAdmin,
}) => {
  return (
    <header className="bg-white border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top micro-bar: Location & Quick Hotline & Currency & Admin Key */}
      <div className="bg-emerald-900 text-white px-3 py-1.5 flex items-center justify-between text-xs">
        <button
          onClick={onOpenAddressModal}
          className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors text-right max-w-[55%]"
          title="تغيير موقع التوصيل"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] opacity-80 shrink-0">التوصيل:</span>
          <span className="font-semibold truncate text-[11px]">
            {selectedAddress.area || 'صنعاء - حدة'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
        </button>

        <div className="flex items-center gap-2">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md hover:bg-amber-300 transition-colors shadow-2xs"
              title="صفحة المدير (محمية بكلمة سر)"
            >
              <Lock className="w-3 h-3" />
              <span>إدارة المتجر</span>
            </button>
          )}

          <button
            onClick={onToggleCurrency}
            className="text-[10px] font-bold bg-emerald-800/80 hover:bg-emerald-700 px-1.5 py-0.5 rounded border border-emerald-600/50 text-amber-300"
            title="تبديل العملة"
          >
            {currency}
          </button>
        </div>
      </div>

      {/* Main Header Row: Logo & Search */}
      <div className="px-3 pt-2.5 pb-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Logo Brand with Store Name */}
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-emerald-950 tracking-tight leading-none">
                  متجر الجمل
                </h1>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60 px-1.5 py-0.5 rounded-full">
                  طازج يومياً
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5 truncate">
                المركز الرئيسي: حدة داخل التوفير هايبر
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar matching the mockup Screen 1 input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن خضرواتك، فواكهك أو تمورك المفضلة..."
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-full py-2.5 pr-10 pl-9 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all placeholder:text-stone-400 shadow-inner"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <Search className="w-4 h-4 text-emerald-700" />
          </div>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
