'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface ProductBreadcrumbsProps {
  productSlug: string;
  productName: string;
}

export function ProductBreadcrumbs(_props: ProductBreadcrumbsProps) {
  return <Breadcrumbs items={[]} showBackButton />;
}
