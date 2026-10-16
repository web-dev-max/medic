'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoManager from '../../PhotoManager';

interface ProductImage {
  url: string;
  mediaId: number;
  ordering: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  brandId: number;
  shortDescription: string;
  description: string;
  price: number;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  published: number;
  images: ProductImage[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    brandId: '',
    shortDescription: '',
    description: '',
    price: '',
    seoTitle: '',
    seoDescription: '',
    slug: '',
    published: true,
  });

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data);
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        categoryId: data.categoryId?.toString() || '',
        brandId: data.brandId?.toString() || '',
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        slug: data.slug || '',
        published: data.published === 1,
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      
      // Build payload with correct field names for backend DTO
      const payload: Record<string, unknown> = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        slug: formData.slug,
        published: formData.published,
      };
      
      // Only add category if provided
      if (formData.categoryId) {
        payload.virtuemart_category_id = parseInt(formData.categoryId);
      }
      
      // Only add manufacturer if provided (optional field)
      if (formData.brandId) {
        payload.virtuemart_manufacturer_id = parseInt(formData.brandId);
      }
      
      // Only add sku if provided
      if (formData.sku) {
        payload.sku = formData.sku;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }

      router.push('/admin/products');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось обновить товар';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать товар</h1>
          <p className="text-gray-600 mt-2">{product?.name}</p>
        </div>
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-700">
          ← Назад к списку
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Артикул
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <input
              type="number"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              placeholder="ID категории"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Бренд
            </label>
            <input
              type="number"
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              placeholder="ID бренда"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <PhotoManager
          productId={product?.id}
          initialPhotos={(product?.images || []).map(img => ({
            id: img.mediaId > 0 ? img.mediaId : Date.now() + Math.random(),
            url: img.url,
            ordering: img.ordering || 0,
            mediaId: img.mediaId || 0,
          }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена *
          </label>
          <input
            type="number"
            name="price"
            required
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Краткое описание *
          </label>
          <textarea
            name="shortDescription"
            required
            rows={3}
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Полное описание *
          </label>
          <textarea
            name="description"
            required
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO заголовок
          </label>
          <input
            type="text"
            name="seoTitle"
            value={formData.seoTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO описание
          </label>
          <textarea
            name="seoDescription"
            rows={3}
            value={formData.seoDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="url-nazvanie-tovara"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="published"
            id="published"
            checked={formData.published}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
            Опубликовать
          </label>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Link
            href="/admin/products"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
