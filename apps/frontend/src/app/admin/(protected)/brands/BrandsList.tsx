'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  published: number;
}

interface BrandsResponse {
  items: Brand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BrandsListProps {
  brands: BrandsResponse;
}

export default function BrandsList({ brands }: BrandsListProps) {
  const [search, setSearch] = useState('');

  const filteredBrands = brands.items.filter(brand =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот бренд?')) {
      return;
    }

    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Не удалось удалить бренд');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Бренды</h1>
          <p className="text-gray-600 mt-2">Найдено {brands.total} брендов</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Добавить бренд
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск брендов..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{brand.slug}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{brand.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      brand.published === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {brand.published === 1 ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/brands/${brand.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Редактировать
                    </Link>
                    <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-900">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Бренды не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
