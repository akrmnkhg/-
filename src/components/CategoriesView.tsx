import React from 'react';
import { CategoryType, Product } from '../types';
import { CATEGORIES_CONFIG } from '../data/mockData';
import { ChevronLeft, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface CategoriesViewProps {
  products: Product[];
  onSelectCategory: (cat: CategoryType) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  products,
  onSelectCategory,
}) => {
  const departments = CATEGORIES_CONFIG.filter((c) => c.id !== 'all');

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200">
        <h2 className="text-base font-extrabold text-stone-900">أقسام المتجر</h2>
        <p className="text-[11px] text-stone-500">
          اختر القسم وتصفح المنتجات الطازجة المصنفة بعناية فائقة
        </p>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {departments.map((dept) => {
          const deptProducts = products.filter((p) => p.category === dept.id);

          return (
            <div
              key={dept.id}
              onClick={() => onSelectCategory(dept.id as CategoryType)}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row"
            >
              {/* Image banner */}
              <div className="relative h-32 sm:h-auto sm:w-44 shrink-0 overflow-hidden bg-stone-100">
                <img
                  src={dept.image}
                  alt={dept.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {dept.badge && (
                  <span className="absolute top-2.5 right-2.5 bg-emerald-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {dept.badge}
                  </span>
                )}
              </div>

              {/* Department Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md">
                        {dept.numberTag}
                      </span>
                      <h3 className="font-black text-stone-900 text-sm group-hover:text-emerald-800 transition-colors">
                        {dept.name}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      {deptProducts.length} صنف
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    يشمل: {dept.sub}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>تصفح جميع أصناف {dept.name}</span>
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
