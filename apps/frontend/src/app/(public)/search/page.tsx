'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const router = useRouter();
  const query = searchParams.q || '';

  useEffect(() => {
    if (!query) {
      router.push('/catalog');
    } else {
      // Navigate to catalog with search param preserved
      router.push(`/catalog?search=${encodeURIComponent(query)}`);
    }
  }, [query, router]);

  return <Loading text="Поиск..." />;
}
