'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useCategoryPath } from '@/lib/api/hooks';

interface CategoryPathItem {
  id: number;
  name: string;
  slug: string;
}

interface CategoryBreadcrumbsProps {
  categorySlug: string;
}

export function CategoryBreadcrumbs({ categorySlug }: CategoryBreadcrumbsProps) {
  const { data: categoryPath, isLoading } = useCategoryPath(categorySlug) as { data: CategoryPathItem[] | undefined, isLoading: boolean };

  if (isLoading || !categoryPath || categoryPath.length === 0) {
    return null;
  }

  const items: Array<{ label: string; href?: string }> = [
    { label: 'Каталог', href: '/catalog' },
    ...categoryPath.map((cat, index) => ({
      label: cat.name,
      href: index === categoryPath.length - 1 ? undefined : `/catalog/${cat.slug}`,
    })),
  ];

  return <Breadcrumbs items={items} />;
}
