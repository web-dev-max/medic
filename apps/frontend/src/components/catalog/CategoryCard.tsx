'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export function CategoryCard({ id, name, slug: _slug, image, productCount }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog?categoryId=${id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
    >
      {image ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background-alt">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-light">
          <ArrowRight className="h-6 w-6 text-primary" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
        {productCount !== undefined && (
          <p className="mt-0.5 text-xs text-text-muted">
            {productCount} {productCount === 1 ? 'товар' : productCount < 5 ? 'товара' : 'товаров'}
          </p>
        )}
      </div>

      <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}
