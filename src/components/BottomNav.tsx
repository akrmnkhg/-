import React from 'react';
import { Home, Sparkles, LayoutGrid, ShoppingCart, User } from 'lucide-react';

export type NavTab = 'home' | 'offers' | 'categories' | 'cart' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'offers',
      label: 'العروض',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'categories',
      label: 'التصنيفات',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'cart',
      label: 'السلة',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'حسابي',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1.5 px-3 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCart = tab.id === 'cart';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-emerald-900 font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-800' : ''
                  }`}
                >
                  {tab.icon}
                </div>

                {/* Cart Badge */}
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black' : ''}`}>
                {tab.label}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
