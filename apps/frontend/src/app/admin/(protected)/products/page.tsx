import { cookies } from 'next/headers';
import ProductsList from './ProductsList';

async function getProducts(page = 1, search = '', categoryId = '', brandId = '') {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    if (brandId) params.append('brandId', brandId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { page?: string; search?: string; categoryId?: string; brandId?: string };
}) {
  const page = parseInt(searchParams?.page || '1');
  const search = searchParams?.search || '';
  const categoryId = searchParams?.categoryId || '';
  const brandId = searchParams?.brandId || '';

  const products = await getProducts(page, search, categoryId, brandId);

  return <ProductsList products={products} />;
}
