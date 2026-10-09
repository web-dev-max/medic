'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useBrands, useProducts, useCustomFieldFilters } from '@/lib/api/hooks';
import { Loading, ErrorState, EmptyState } from '../ui/Loading';
import { Filters } from './Filters';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ProductCard } from './ProductCard';
import { Pagination } from '../ui/Pagination';
import { useCallback, Suspense } from 'react';

interface CatalogPageProps {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
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
}

function CatalogPageContent({ categoryId, search }: CatalogPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read page from URL params - always sync with URL
  const urlPage = searchParams.get('page');
  const page = urlPage ? Math.max(1, parseInt(urlPage, 10)) : 1;
  
  // Read filters from URL params
  const filters: FilterState = {
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brandId: searchParams.get('brandId') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    customFieldFilters: {},
  };
  
  // Get search from URL params (takes precedence over prop)
  const urlSearch = searchParams.get('search') || search || '';

  const { data: brandsData, isLoading: brandsLoading } = useBrands();

  // Get custom field filters for this category
  const urlCategoryId = searchParams.get('categoryId');
  const activeCategoryId = categoryId || Number(urlCategoryId);
  const { data: customFieldFiltersData } = useCustomFieldFilters(activeCategoryId);

  const productsParams: Record<string, string | number | boolean> = {};
  if (categoryId || urlCategoryId) productsParams.categoryId = categoryId || Number(urlCategoryId);
  if (urlSearch) productsParams.search = urlSearch;
  if (filters.brandId) productsParams.brandId = filters.brandId;
  if (filters.minPrice) productsParams.minPrice = filters.minPrice;
  if (filters.maxPrice) productsParams.maxPrice = filters.maxPrice;

  // Add custom field filters
  const customFilterParts = Object.entries(filters.customFieldFilters).map(([fieldId, values]) => {
    if (values && values.length > 0) {
      return `${fieldId}:${values.join('|')}`;
    }
    return null;
  }).filter(Boolean);

  if (customFilterParts.length > 0) {
    // Use first custom filter (can be extended for multiple)
    const firstFilter = customFilterParts[0];
    if (firstFilter) {
      productsParams.customFilter = firstFilter;
    }
  }

  productsParams.page = page;
  productsParams.pageSize = 12;
  if (filters.sortBy) productsParams.sortBy = filters.sortBy;
  if (filters.sortOrder) productsParams.sortOrder = filters.sortOrder;

  const { data: productsData, error } = useProducts(productsParams);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    // Build URL preserving existing params
    const params = new URLSearchParams();
    
    // Preserve search param
    const currentSearch = searchParams.get('search');
    if (currentSearch) params.set('search', currentSearch);
    
    // Preserve page param
    const currentPage = searchParams.get('page');
    if (currentPage) params.set('page', currentPage);
    
    // Add filters
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.brandId) params.set('brandId', newFilters.brandId);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
    
    // Add custom field filters
    Object.entries(newFilters.customFieldFilters).forEach(([fieldId, values]) => {
      if (values && values.length > 0) {
        params.set(`customField_${fieldId}`, values.join(','));
      }
    });
    
    router.push(`/catalog?${params.toString()}`);
  }, [searchParams, router]);

  const handlePageChange = useCallback((newPage: number) => {
    // Don't use setPage - page is derived from URL
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`/catalog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, router]);

  const brands = ((brandsData as unknown as { items?: unknown[] })?.items || brandsData || []) as Array<{ id: number; name: string }>;
  const products = (productsData as unknown as { items?: unknown[] })?.items || (productsData as unknown as { data?: { items?: unknown[] } })?.data?.items || [];
  const total = (productsData as unknown as { total?: number })?.total || 0;
  const totalPages = (productsData as unknown as { totalPages?: number })?.totalPages || 1;

  // Custom field filters are already grouped by field
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
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <aside className="hidden w-full shrink-0 lg:block lg:w-72 xl:w-80">
            <div className="sticky top-40 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-white p-6">
              <Filters
                brands={brands}
                customFieldFilters={customFieldFilters}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          <MobileFilterDrawer
            brands={brands}
            customFieldFilters={customFieldFilters}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Products */}
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
                      image={p.images?.[0]}
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
                      onPageChange={handlePageChange}
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

export function CatalogPage({ categoryId, search }: CatalogPageProps) {
  return (
    <Suspense fallback={<Loading text="Загрузка каталога..." />}>
      <CatalogPageContent categoryId={categoryId} search={search} />
    </Suspense>
  );
}
