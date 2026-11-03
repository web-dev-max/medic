import type { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/constants';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ErrorState } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';

interface CatalogPageProps {
  searchParams: { page?: string };
}

export const metadata: Metadata = {
  title: 'Каталог — Медицинское и стоматологическое оборудование',
  description: 'Полный каталог медицинского и стоматологического оборудования. Стоматологические установки, стерилизационное оборудование, рентгенодиагностика и многое другое.',
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    title: 'Каталог — Медиком Плюс',
    description: 'Полный каталог медицинского и стоматологического оборудования.',
  },
};

async function getCatalogCategories(page: number = 1, limit: number = 12) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  const response = await fetch(`${API_BASE_URL}/categories/catalog?${params.toString()}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export default async function CatalogPageRoute({ searchParams }: CatalogPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;

  let categoriesData;
  try {
    categoriesData = await getCatalogCategories(validPage);
  } catch {
    return (
      <div className="section">
        <div className="container">
          <ErrorState
            message="Не удалось загрузить каталог"
            showBackButton
          />
        </div>
      </div>
    );
  }

  const categories = categoriesData?.items || [];
  const totalPages = categoriesData?.totalPages || 1;
  const currentPage = categoriesData?.page || validPage;

  return (
    <div className="section">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Каталог</h1>
          <p className="mt-2 text-text-muted">
            Выберите категорию оборудования
          </p>
        </div>

        {categories.length === 0 ? (
          <ErrorState
            message="Каталоги временно недоступны"
            showBackButton
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category: { id: number; name: string; slug: string; image?: string; productCount?: number }) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  slug={category.slug}
                  image={category.image}
                  productCount={category.productCount}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
