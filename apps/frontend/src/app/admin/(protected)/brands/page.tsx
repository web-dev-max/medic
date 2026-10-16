import { cookies } from 'next/headers';
import BrandsList from './BrandsList';

async function getBrands() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/brands?page=1&pageSize=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return <BrandsList brands={brands} />;
}
