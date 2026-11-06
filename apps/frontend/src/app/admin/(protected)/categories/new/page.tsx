'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    categoryCode: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    published: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Название должно содержать минимум 2 символа';
    }

    if (!formData.categoryCode.trim()) {
      newErrors.categoryCode = 'Номер категории обязателен';
    } else if (formData.categoryCode.length > 50) {
      newErrors.categoryCode = 'Номер категории не может превышать 50 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          categoryCode: formData.categoryCode.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          published: formData.published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400 && data.message) {
          setErrors({ form: data.message });
          return;
        }
        throw new Error(data.message || 'Failed to create category');
      }

      router.push('/admin/categories');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать категорию';
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добавить категорию</h1>
          <p className="text-gray-600 mt-2">Заполните информацию о категории</p>
        </div>
        <Link href="/admin/categories" className="text-blue-600 hover:text-blue-700">
          ← Назад к списку
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-lg shadow p-6 space-y-6">
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.form}
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
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Код категории *
            </label>
            <input
              type="text"
              name="categoryCode"
              value={formData.categoryCode}
              onChange={handleChange}
              placeholder="Например: COMP-001"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.categoryCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">Уникальный код категории. Используется для привязки товаров к соответствующей категории.</p>
            {errors.categoryCode && <p className="mt-1 text-sm text-red-600">{errors.categoryCode}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL категории)
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="url-kategorii"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">Оставьте пустым для автогенерации из названия</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            href="/admin/categories"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Создание...' : 'Создать категорию'}
          </button>
        </div>
      </form>
    </div>
  );
}
