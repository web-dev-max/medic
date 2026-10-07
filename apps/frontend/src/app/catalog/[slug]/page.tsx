import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { apiClient } from '@/lib/api/client';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
  try {
    const categories = await apiClient.getCategoryTree();
    const categorized = categories as unknown[];
    return categorized.map((cat: unknown) => ({ slug: (cat as { slug: string }).slug }));
  } catch {
    return [];
  }
}

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

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  try {
    const category = await apiClient.getCategory(params.slug);
    const categorized = category as unknown as { id?: number };

    if (!categorized?.id) {
      notFound();
    }

    return (
      <div className="section">
        <div className="container">
          <CatalogPage categoryId={categorized.id} />
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
