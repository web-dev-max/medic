'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Filters } from './Filters';
import type { FilterState } from './Filters';

interface CustomFieldFilter {
  fieldId: number;
  fieldTitle: string;
  fieldElement: string;
  value: string;
  productCount: number;
}

interface MobileFilterDrawerProps {
  brands?: Array<{ id: number; name: string }>;
  customFieldFilters?: CustomFieldFilter[][];
  subCategories?: Array<{ id: number; name: string }>; // 👈
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function MobileFilterDrawer({
  brands,
  customFieldFilters,
  subCategories, // 👈
  filters,
  onFilterChange,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl md:hidden"
        aria-label="Открыть фильтры"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Фильтры</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-text-primary">Фильтры</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-text-muted hover:bg-background-alt hover:text-text-primary transition-colors"
              aria-label="Закрыть фильтры"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <Filters
              brands={brands}
              customFieldFilters={customFieldFilters}
              subCategories={subCategories} // 👈
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </div>

          <div className="border-t border-border bg-white px-4 py-4 sm:px-6">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Показать результаты
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
