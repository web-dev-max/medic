import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';

// Products
export function useProducts(params?: Record<string, string | number | boolean>, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.getProducts(params),
    ...options,
  });
}

export function useSearchProducts(query: string, limit: number = 5, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: () => apiClient.searchProducts(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useProduct(slug: string, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiClient.getProduct(slug),
    enabled: !!slug,
    ...options,
  });
}

// Categories
export function useCategories(options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    ...options,
  });
}

export function useHomepageCategories(options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['categories', 'homepage'],
    queryFn: () => apiClient.getHomepageCategories(),
    ...options,
  });
}

export function useCategoryTree(options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => apiClient.getCategoryTree(),
    ...options,
  });
}

export function useCategory(slug: string, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => apiClient.getCategory(slug),
    enabled: !!slug,
    ...options,
  });
}

// Brands
export function useBrands(options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => apiClient.getBrands(),
    ...options,
  });
}

// Custom field filters
export function useCustomFieldFilters(categoryId?: number, customFieldId?: number, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['customFieldFilters', categoryId, customFieldId],
    queryFn: () => apiClient.getCustomFieldFilters(categoryId!, customFieldId),
    enabled: !!categoryId,
    ...options,
  });
}

// Content
export function useContent(slug: string, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['content', slug],
    queryFn: () => apiClient.getContent(slug),
    enabled: !!slug,
    ...options,
  });
}
