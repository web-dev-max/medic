import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { ProductClient } from './ProductClient';
import { ProductBreadcrumbs } from '@/components/layout/ProductBreadcrumbs';
import { apiClient } from '@/lib/api/client';

interface ProductPageRouteProps {
  params: { slug: string };
}

// Force dynamic rendering because we use searchParams and dynamic product data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageRouteProps): Promise<Metadata> {
  try {
    const data = await apiClient.getProduct(params.slug);
    const product = (data as unknown as { items?: unknown[] })?.items?.[0] || data;
    const productData = product as unknown as {
      seoTitle?: string;
      name?: string;
      seoDescription?: string;
      shortDescription?: string;
      images?: string[];
      price?: string;
    };
    return {
      title: productData?.seoTitle || `${productData?.name} — Медиком Плюс`,
      description: productData?.seoDescription || productData?.shortDescription || '',
      alternates: {
        canonical: `/product/${params.slug}`,
      },
      openGraph: {
        title: productData?.seoTitle || productData?.name,
        description: productData?.seoDescription || productData?.shortDescription,
        images: productData?.images ? [{ url: productData.images[0], alt: productData.name || '' }] : undefined,
      },
      other: {
        'schema:type': 'Product',
        'schema:price': String(productData?.price || ''),
        'schema:availability': 'https://schema.org/InStock',
      },
    };
  } catch {
    return {
      title: 'Товар — Медиком Плюс',
    };
  }
}

export default async function ProductPageRoute({ params }: ProductPageRouteProps) {
  console.log('[ProductPage] Params:', params);
  console.log('[ProductPage] Slug from params:', params.slug);
  
  try {
    const data = await apiClient.getProduct(params.slug);
    const product = (data as unknown as { items?: unknown[] })?.items?.[0] || data;
    const productData = product as unknown as { name?: string };
    
    if (!product) {
      console.log('[ProductPage] Product not found in API');
      notFound();
    }

    return (
      <div className="section">
        <div className="container">
          <ProductBreadcrumbs 
            productSlug={params.slug}
            productName={productData?.name || 'Товар'}
          />

          <ProductClient slug={params.slug} />
        </div>
      </div>
    );
  } catch (error) {
    console.log('[ProductPage] Error fetching product:', error);
    notFound();
  }
}
