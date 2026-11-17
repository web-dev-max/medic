'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useCategoryPath } from '@/lib/api/hooks';

interface CategoryPathItem {
  id: number;
  name: string;
  slug: string;
  isRoot: boolean;
}

interface CategoryBreadcrumbsProps {
  categorySlug: string;
}

export function CategoryBreadcrumbs({ categorySlug }: CategoryBreadcrumbsProps) {
  const { data: categoryPath, isLoading } = useCategoryPath(categorySlug) as {
    data: CategoryPathItem[] | undefined;
    isLoading: boolean;
  };

  if (isLoading || !categoryPath || categoryPath.length === 0) {
    return null;
  }

  const current = categoryPath[categoryPath.length - 1];

  const ancestors = categoryPath.slice(0, -1);

  const items: Array<{ label: string; href?: string }> = [
    { label: 'Каталог', href: '/catalog' },
    ...ancestors.map((cat) => ({
      label: cat.name,
      href: `/catalog/${cat.slug}`,
    })),
    { label: current.name, href: undefined }, // текущая — не кликается
  ];

  return <Breadcrumbs items={items} />;
}
