'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface FilterState {
  minPrice: string;
  maxPrice: string;
  brandId: string;
  sortBy: string;
  sortOrder: string;
  customFieldFilters: Record<string, string[]>;
}

interface CustomFieldFilter {
  fieldId: number;
  fieldTitle: string;
  fieldElement: string;
  value: string;
  productCount: number;
}

interface FiltersProps {
  brands?: Array<{ id: number; name: string }>;
  customFieldFilters?: CustomFieldFilter[][];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function CustomFieldFilterSection({
  field,
  selectedValues,
  onValueChange,
}: {
  field: { fieldId: number; fieldTitle: string; values: Array<{ value: string; productCount: number }> };
  selectedValues: string[];
  onValueChange: (fieldId: number, values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onValueChange(field.fieldId, newValues);
  };

  return (
    <div className="space-y-3 border rounded-lg p-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-sm font-medium text-text-primary">{field.fieldTitle}</h4>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="space-y-2">
          {field.values.map(v => (
            <label key={v.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(v.value)}
                onChange={() => toggleValue(v.value)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">{v.value}</span>
              <span className="text-xs text-text-muted">({v.productCount})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function Filters({ brands, customFieldFilters, filters, onFilterChange }: FiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleCustomFieldChange = (fieldId: number, values: string[]) => {
    const newCustomFilters = { ...filters.customFieldFilters };
    if (values.length > 0) {
      newCustomFilters[fieldId] = values;
    } else {
      delete newCustomFilters[fieldId];
    }
    onFilterChange({ ...filters, customFieldFilters: newCustomFilters });
  };

  const handleReset = () => {
    onFilterChange({
      minPrice: '',
      maxPrice: '',
      brandId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      customFieldFilters: {},
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.brandId || Object.keys(filters.customFieldFilters).length > 0;

  // Build custom field sections
  const customFieldSections = customFieldFilters?.map(fieldGroup => ({
    fieldId: fieldGroup[0].fieldId,
    fieldTitle: fieldGroup[0].fieldTitle,
    values: fieldGroup.map(f => ({ value: f.value, productCount: f.productCount })),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Фильтры
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-text-muted hover:text-primary transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Custom field filters */}
      {customFieldSections.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Характеристики</h4>
          <div className="space-y-2">
            {customFieldSections.map(section => (
              <CustomFieldFilterSection
                key={section.fieldId}
                field={section}
                selectedValues={filters.customFieldFilters[section.fieldId] || []}
                onValueChange={handleCustomFieldChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">Цена</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="От"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
          />
          <Input
            type="number"
            placeholder="До"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Brand */}
      {brands && brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Производитель</h4>
          <Select
            value={filters.brandId}
            onChange={(e) => updateFilter('brandId', e.target.value)}
            options={[
              { value: '', label: 'Все производители' },
              ...brands.map((b) => ({ value: String(b.id), label: b.name })),
            ]}
          />
        </div>
      )}

      {/* Sort */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">Сортировка</h4>
        <div className="space-y-2">
          <Select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            options={[
              { value: 'createdAt', label: 'Новизна' },
              { value: 'price', label: 'Цена' },
              { value: 'name', label: 'Название' },
            ]}
          />
          <Select
            value={filters.sortOrder}
            onChange={(e) => updateFilter('sortOrder', e.target.value)}
            options={[
              { value: 'desc', label: 'По убыванию' },
              { value: 'asc', label: 'По возрастанию' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
