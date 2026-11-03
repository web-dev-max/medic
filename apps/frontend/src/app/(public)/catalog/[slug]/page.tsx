import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { CategoryBreadcrumbs } from '@/components/layout/CategoryBreadcrumbs';
import { apiClient } from '@/lib/api/client';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Force dynamic rendering because we use searchParams
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const category = await apiClient.getCategory(params.slug);
    const categorized = category as unknown as { seoTitle?: string; name?: string; seoDescription?: string; description?: string } | null;
    return {
      title: categorized?.seoTitle || `${categorized?.name} — Медиком Плюс`,
      description: categorized?.seoDescription || categorized?.description || '',
      alternates: {
        canonical: `/catalog/${params.slug}`,
      },
    };
  } catch {
    return {
      title: 'Категория — Медиком Плюс',
    };
  }
}

export default async function CategoryPageRoute({ params, searchParams }: CategoryPageProps) {
  try {
    const category = await apiClient.getCategory(params.slug);
    const categorized = category as unknown as { id?: number };

    if (!categorized?.id) {
      notFound();
    }

    return (
      <div className="section">
        <div className="container">
          <CategoryBreadcrumbs categorySlug={params.slug} />
          
          <CatalogPage
            categoryId={categorized.id}
            categorySlug={params.slug}
            search={searchParams?.search as string}
          />
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
