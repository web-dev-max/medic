'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useBrands, useProducts, useCustomFieldFilters, useSubCategories } from '@/lib/api/hooks';
import { Loading, ErrorState, EmptyState } from '../ui/Loading';
import { Filters } from './Filters';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ProductCard } from './ProductCard';
import { Pagination } from '../ui/Pagination';
import { useCallback, useMemo, Suspense } from 'react';

interface CatalogPageProps {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
}

function buildCategoryUrl(
  categorySlug: string | undefined,
  params: URLSearchParams
): string {
  if (categorySlug) {
    return `/catalog/${categorySlug}?${params.toString()}`;
  }
  return `/catalog?${params.toString()}`;
}

interface CustomFieldFilter {
  fieldId: number;
  fieldTitle: string;
  fieldElement: string;
  value: string;
  productCount: number;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  brandId: string;
  sortBy: string;
  sortOrder: string;
  customFieldFilters: Record<string, string[]>;
  subCategoryId: string;
}

function CatalogPageContent({ categoryId, categorySlug: propCategorySlug, search }: CatalogPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  let categorySlug = propCategorySlug;
  if (!categorySlug && pathname && pathname.startsWith('/catalog/')) {
    const parts = pathname.split('/');
    if (parts.length > 2) {
      categorySlug = parts[2];
    }
  }

  const urlPage = searchParams.get('page');
  const page = urlPage ? Math.max(1, parseInt(urlPage, 10)) : 1;

  const customFieldFiltersFromUrl: Record<string, string[]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('customField_')) {
      const fieldId = key.replace('customField_', '');
      customFieldFiltersFromUrl[fieldId] = value.split(',');
    }
  });

  const filters: FilterState = {
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brandId: searchParams.get('brandId') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    customFieldFilters: customFieldFiltersFromUrl,
    subCategoryId: searchParams.get('subCategoryId') || '',
  };

  const urlSearch = searchParams.get('search') || search || '';

  const { data: brandsData, isLoading: brandsLoading } = useBrands();

  const urlCategoryId = searchParams.get('categoryId');
  const activeCategoryId = categoryId || Number(urlCategoryId);

  const { data: customFieldFiltersData } = useCustomFieldFilters(activeCategoryId);

  // 👇 ЗАПРОС ПОДКАТЕГОРИЙ
  const { data: subCategoriesData } = useSubCategories(activeCategoryId);
  // 👇 ИЗВЛЕКАЕМ МАССИВ
  const subCategories = (subCategoriesData as any)?.items || [];

  // 👇 ОБОРАЧИВАЕМ В useMemo, чтобы избежать бесконечных ререндеров
  const productsParams = useMemo(() => {
    const p: Record<string, string | number | boolean> = {};

    if (filters.subCategoryId) {
      p.categoryId = Number(filters.subCategoryId);
    } else if (activeCategoryId) {
      p.categoryId = activeCategoryId;
    }

    if (urlSearch) p.search = urlSearch;
    if (filters.brandId) p.brandId = filters.brandId;
    if (filters.minPrice) p.minPrice = filters.minPrice;
    if (filters.maxPrice) p.maxPrice = filters.maxPrice;

    const customFilterParts = Object.entries(filters.customFieldFilters).map(([fieldId, values]) => {
      if (values && values.length > 0) {
        return `${fieldId}:${values.join('|')}`;
      }
      return null;
    }).filter(Boolean);

    if (customFilterParts.length > 0) {
      const firstFilter = customFilterParts[0];
      if (firstFilter) p.customFilter = firstFilter;
    }

    p.page = page;
    p.pageSize = 12;
    if (filters.sortBy) p.sortBy = filters.sortBy;
    if (filters.sortOrder) p.sortOrder = filters.sortOrder;

    return p;
  }, [filters, activeCategoryId, urlSearch, page]);

  const { data: productsData, error } = useProducts(productsParams);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();

    const currentSearch = searchParams.get('search');
    if (currentSearch) params.set('search', currentSearch);

    // Page НЕ переносим при смене фильтров — сбрасываем на 1

    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.brandId) params.set('brandId', newFilters.brandId);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.subCategoryId) params.set('subCategoryId', newFilters.subCategoryId);

    Object.entries(newFilters.customFieldFilters).forEach(([fieldId, values]) => {
      if (values && values.length > 0) {
        params.set(`customField_${fieldId}`, values.join(','));
      }
    });

    const url = buildCategoryUrl(categorySlug, params);
    router.push(url);
  }, [searchParams, router, categorySlug]);

  const brands = ((brandsData as unknown as { items?: unknown[] })?.items || brandsData || []) as Array<{ id: number; name: string }>;
  const products = (productsData as unknown as { items?: unknown[] })?.items || (productsData as unknown as { data?: { items?: unknown[] } })?.data?.items || [];
  const total = (productsData as unknown as { total?: number })?.total || 0;
  const totalPages = (productsData as unknown as { totalPages?: number })?.totalPages || 1;

  const customFieldFilters = customFieldFiltersData as CustomFieldFilter[][] | undefined;

  if (brandsLoading) {
    return <Loading text="Загрузка каталога..." />;
  }

  if (error) {
    return <ErrorState message="Не удалось загрузить каталог" onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="section">
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-full shrink-0 lg:block lg:w-72 xl:w-80">
            <div className="sticky top-40 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-white p-6">
              <Filters
                brands={brands}
                customFieldFilters={customFieldFilters}
                filters={filters}
                onFilterChange={handleFilterChange}
                subCategories={subCategories}
              />
            </div>
          </aside>

          <MobileFilterDrawer
            brands={brands}
            customFieldFilters={customFieldFilters}
            filters={filters}
            onFilterChange={handleFilterChange}
            subCategories={subCategories}
          />

          <div className="flex-1 min-w-0">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <h1 className="text-2xl font-bold text-text-primary">
                {urlSearch ? `Результаты поиска: "${urlSearch}"` : categoryId ? 'Товары' : 'Каталог оборудования'}
              </h1>
              <span className="text-sm text-text-muted">
                Найдено: {total} {total === 1 ? 'товар' : total < 5 ? 'товара' : 'товаров'}
              </span>
            </div>

            {products.length === 0 ? (
              <EmptyState
                title="Товары не найдены"
                description="Попробуйте изменить параметры поиска или фильтрации"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(products as unknown[]).map((product: unknown) => {
                    const p = product as { id: number; name: string; slug: string; price: string; oldPrice?: string; images?: string[]; brand?: { name: string } };
                    return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      price={parseFloat(p.price)}
                      oldPrice={p.oldPrice ? parseFloat(p.oldPrice) : undefined}
                      images={p.images}
                      brand={p.brand?.name}
                    />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mb-20 mt-8 md:mb-0">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogPage({ categoryId, categorySlug, search }: CatalogPageProps) {
  return (
    <Suspense fallback={<Loading text="Загрузка каталога..." />}>
      <CatalogPageContent categoryId={categoryId} categorySlug={categorySlug} search={search} />
    </Suspense>
  );
}
