'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useSearchProducts } from '@/lib/api/hooks';
import { debounce } from '@/lib/utils';
import { ImageWithPlaceholder } from '@/components/ui/ImageWithPlaceholder';

interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  brand?: { name: string };
}

export function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced query for API
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce handler
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSetQuery(value);
    
    // Show dropdown only when there's input
    if (value.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Use debounced query for API search - get more results for better relevance
  const { data, isLoading, error } = useSearchProducts(debouncedQuery, 10, {
    enabled: debouncedQuery.length > 0,
    // Don't cache autocomplete results aggressively
    staleTime: 1000 * 60, // 1 minute
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get products from search results
  const products = ((data as unknown as { items?: unknown[] })?.items || []) as SearchProduct[];

  // Handle product click
  const handleProductClick = () => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Submit goes to /search with query param
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (!isFocused && !query) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск по товарам, категориям, брендам..."
          className="w-full rounded-lg border border-border py-2.5 pl-4 pr-12 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          onFocus={() => setIsFocused(true)}
        />
        <button
          type="submit"
          className="absolute right-0 top-0 flex h-full w-11 items-center justify-center rounded-r-lg text-text-muted hover:text-primary"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск по товарам, категориям, брендам..."
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay closing to allow clicks on results
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="w-full rounded-lg border border-border py-2.5 pl-4 pr-24 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <div className="absolute right-0 top-0 flex h-full">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-full w-11 items-center justify-center text-text-muted hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            className="flex h-full w-11 items-center justify-center rounded-r-lg text-text-muted hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-border bg-white shadow-lg">
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-sm text-text-muted">
              Поиск...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-500">
              Ошибка поиска. Попробуйте ещё раз.
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && products.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              <div className="border-b border-border px-4 py-2 text-xs font-medium text-text-muted">
                Товары
              </div>
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${encodeURIComponent(product.slug)}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-background-alt transition-colors"
                  onClick={handleProductClick}
                >
                  {/* Product Image */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-background-alt overflow-hidden">
                    <ImageWithPlaceholder
                      src={product.images && product.images.length > 0 ? product.images[0] : null}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {product.name}
                    </span>
                    {product.brand?.name && (
                      <span className="text-xs text-text-muted">
                        {product.brand.name}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-primary">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && products.length === 0 && query.trim().length > 0 && (
            <div className="px-4 py-6 text-center">
              <div className="mb-2 text-text-muted">
                <Search className="mx-auto h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-medium text-text-primary">
                Ничего не найдено
              </p>
              <p className="mt-1 text-xs text-text-muted">
                По вашему запросу «{query}» товары не найдены
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
