import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  return {
    title: query ? `Поиск: ${query} — Медиком Плюс` : 'Поиск — Медиком Плюс',
    description: `Результаты поиска: ${query}`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  if (!query) {
    redirect('/catalog');
  }

  // Redirect to catalog with search param
  redirect(`/catalog?search=${encodeURIComponent(query)}`);
}
