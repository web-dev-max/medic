'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useProductCategoryPath } from '@/lib/api/hooks';

interface CategoryPathItem {
  id: number;
  name: string;
  slug: string;
}

interface ProductBreadcrumbsProps {
  productSlug: string;
  productName: string;
}

export function ProductBreadcrumbs({ productSlug, productName }: ProductBreadcrumbsProps) {
  const { data, isLoading } = useProductCategoryPath(productSlug) as { data: CategoryPathItem[] | undefined, isLoading: boolean };
  const categoryPath = data || [];

  if (isLoading) {
    return null;
  }

  const items: Array<{ label: string; href?: string }> = [
    { label: 'Каталог', href: '/catalog' },
    ...categoryPath.map((cat, index) => ({
      label: cat.name,
      href: index === categoryPath.length - 1 ? undefined : `/catalog/${cat.slug}`,
    })),
    { label: productName, href: undefined },
  ];

  return <Breadcrumbs items={items} />;
}
