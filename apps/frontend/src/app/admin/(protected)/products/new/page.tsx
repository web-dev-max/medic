'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoManager from '../PhotoManager';

export default function NewProductPage() {
  const _router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [productCreated, setProductCreated] = useState(false);

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
    setLoading(true);

    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      
      // Validate required fields
      if (!formData.categoryId || !formData.categoryId.trim()) {
        throw new Error('Категория обязательна для заполнения');
      }
      
      // Build payload with correct field names for backend DTO
      const payload: Record<string, unknown> = {
        name: formData.name,
        virtuemart_category_id: parseInt(formData.categoryId),
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        slug: formData.slug,
        published: formData.published,
      };
      
      // Only add manufacturer if provided (optional field)
      if (formData.brandId && formData.brandId.trim()) {
        payload.virtuemart_manufacturer_id = parseInt(formData.brandId);
      }
      
      // Only add sku if provided
      if (formData.sku && formData.sku.trim()) {
        payload.sku = formData.sku;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create product');
      }

      const data = await response.json();
      setCreatedProductId(data.id);
      setProductCreated(true);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать товар';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добавить товар</h1>
          <p className="text-gray-600 mt-2">Заполните информацию о товаре</p>
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Создание...' : 'Создать товар'}
          </button>
        </div>
      </form>

      {productCreated && createdProductId && (
        <div className="max-w-4xl mt-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Товар успешно создан! Теперь добавьте фотографии.
          </div>
          <PhotoManager
            productId={createdProductId}
            initialPhotos={[]}
          />
          <div className="mt-4 flex gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Перейти к списку товаров
            </Link>
            <Link
              href={`/admin/products/${createdProductId}/edit`}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Редактировать товар
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
