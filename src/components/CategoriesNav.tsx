import React from 'react';
import { CategoryType } from '../types';
import { Sparkles, Crown, Carrot, Globe, SunMedium, Apple } from 'lucide-react';

interface CategoriesNavProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  variant?: 'chips' | 'grid';
}

const CATEGORIES: {
  id: CategoryType;
  label: string;
  tag: string;
  sub: string;
  icon: React.ReactNode;
  bgGradient: string;
  imgUrl: string;
}[] = [
  {
    id: 'all',
    label: 'جميع الأقسام',
    tag: 'الكل',
    sub: 'كل المعروضات الطازجة',
    icon: <Sparkles className="w-4 h-4 text-emerald-700" />,
    bgGradient: 'from-emerald-500/10 to-emerald-700/10',
    imgUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'local_fruits',
    label: 'فواكه بلدي',
    tag: 'قسم ١',
    sub: 'رمان صعدي، عنب رازقي، مانجو، شمام',
    icon: <Apple className="w-4 h-4 text-emerald-700" />,
    bgGradient: 'from-emerald-600/15 to-emerald-900/15',
    imgUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'imported_fruits',
    label: 'فواكه مستوردة',
    tag: 'قسم ٢',
    sub: 'تفاح واشنطن، أفوكادو، موز، كيوي، أناناس',
    icon: <Globe className="w-4 h-4 text-blue-700" />,
    bgGradient: 'from-blue-600/15 to-indigo-900/15',
    imgUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'vegetables',
    label: 'خضروات',
    tag: 'قسم ٣',
    sub: 'طماطم، خيار، ورقيات، بطاطس، كوسة، بروكلي',
    icon: <Carrot className="w-4 h-4 text-green-700" />,
    bgGradient: 'from-green-600/15 to-emerald-900/15',
    imgUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'dates',
    label: 'تمور فاخرة',
    tag: 'قسم ٤',
    sub: 'مجدول ملكي، عجوة، سكري، خلاص، صقعي',
    icon: <Crown className="w-4 h-4 text-amber-700" />,
    bgGradient: 'from-amber-600/15 to-stone-800/15',
    imgUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'dried_fruits',
    label: 'فواكه مجففة',
    tag: 'قسم ٥',
    sub: 'تين تركي، مشمش، زبيب رازقي، قراصيا',
    icon: <SunMedium className="w-4 h-4 text-orange-700" />,
    bgGradient: 'from-orange-600/15 to-amber-900/15',
    imgUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=200&auto=format&fit=crop&q=80',
  },
];

export const CategoriesNav: React.FC<CategoriesNavProps> = ({
  activeCategory,
  onSelectCategory,
  variant = 'chips',
}) => {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`text-right p-3 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group shadow-xs cursor-pointer ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-800 text-white shadow-md'
                  : 'border-stone-200/90 bg-white hover:border-emerald-300 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2 z-10">
                <span
                  className={`p-1.5 rounded-xl text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {cat.icon}
                </span>
                <span
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-amber-400 text-stone-900'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                  }`}
                >
                  {cat.tag}
                </span>
              </div>
              <div className="z-10">
                <h3 className="font-bold text-xs sm:text-sm leading-tight">{cat.label}</h3>
                <p
                  className={`text-[9.5px] mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-emerald-100' : 'text-stone-500'
                  }`}
                >
                  {cat.sub}
                </p>
              </div>
              <img
                src={cat.imgUrl}
                alt={cat.label}
                className={`absolute -bottom-4 -left-4 w-16 h-16 object-cover rounded-full opacity-20 pointer-events-none transition-transform group-hover:scale-110 ${
                  isSelected ? 'opacity-30' : ''
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="py-2 overflow-x-auto scrollbar-none px-3 -mx-3 flex items-center gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700/30'
                : 'bg-white text-stone-700 border border-stone-200/80 hover:border-emerald-600/40 hover:bg-stone-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {cat.id !== 'all' && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {cat.tag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
