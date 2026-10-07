'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useHomepageCategories } from '@/lib/api/hooks';
import { Loading } from '@/components/ui/Loading';

interface Category {
  id: number;
  name: string;
  image?: string;
}

export function CategoryGrid() {
  const { data: categoriesData, isLoading, error } = useHomepageCategories();
  const categories = categoriesData as Category[] | undefined;

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              Каталог оборудования
            </h2>
          </div>
          <Loading text="Загрузка категорий..." />
        </div>
      </section>
    );
  }

  if (error || (categories as unknown[]).length === 0) {
    return (
      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              Каталог оборудования
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-background-alt p-8 text-center">
            <p className="text-text-muted">
              Категории временно недоступны. Пожалуйста, зайдите позже.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
            Каталог оборудования
          </h2>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Все категории
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
          {(categories || []).map((category: Category) => (
            <Link
              key={category.id}
              href={`/catalog?categoryId=${category.id}`}
              className="group flex flex-col items-center rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Category Image from DB */}
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-background-alt p-2 overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement?.classList.add('bg-primary/10');
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-primary/10" />
                )}
              </div>
              <span className="text-center text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <ArrowRight className="mt-1 h-3.5 w-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
