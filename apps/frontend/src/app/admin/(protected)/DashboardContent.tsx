'use client';

import Link from 'next/link';

interface Order {
  id: number;
  order_total: string;
  order_number: string;
  order_status: string;
  customer_name: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

interface TopProduct {
  id: number;
  name: string;
  stock: number;
  price: number;
  inventoryValue: number;
}

interface Statistics {
  products: { total: number; published: number; unpublished: number };
  categories: { total: number; published: number };
  brands: { total: number; published: number };
  orders: { total: number; recent: Order[] };
  revenue: { total: number };
  inventory: { topProducts: TopProduct[]; lowStock: LowStockProduct[] };
}

interface DashboardContentProps {
  statistics: Statistics | null;
}

export default function DashboardContent({ statistics }: DashboardContentProps) {
  if (!statistics) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Не удалось загрузить данные</p>
          <p className="text-sm mt-2">Пожалуйста, попробуйте позже</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600 mt-2">Обзор вашего магазина</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего товаров</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.products.total}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600">{statistics.products.published} опубликовано</span>
            {' · '}
            <span className="text-gray-400">{statistics.products.unpublished} не опубликовано</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Категории</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.categories.total}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600">{statistics.categories.published} активных</span>
          </div>
        </div>

        {/* Brands */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Бренды</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.brands.total}</p>
            </div>
            <div className="text-4xl">🏭</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600">{statistics.brands.published} активных</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Общая выручка</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.revenue.total.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span>{statistics.orders.total} заказов</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Последние заказы</h2>
          </div>
          <div className="p-6">
            {statistics.orders.recent && statistics.orders.recent.length > 0 ? (
              <div className="space-y-4">
                {statistics.orders.recent.map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_name || 'Клиент'}</p>
                      <p className="text-xs text-gray-500">{order.order_number || new Date().toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{parseFloat(order.order_total).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет последних заказов</p>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Мало на складе</h2>
          </div>
          <div className="p-6">
            {statistics.inventory.lowStock && statistics.inventory.lowStock.length > 0 ? (
              <div className="space-y-4">
                {statistics.inventory.lowStock.map((product: LowStockProduct) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <Link href={`/admin/products`} className="text-xs text-blue-600 hover:text-blue-700">
                        Редактировать
                      </Link>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      на складе: {product.stock}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Все товары хорошо обеспечены</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products by Inventory Value */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Топ товаров по стоимости склада</h2>
        </div>
        <div className="p-6">
          {statistics.inventory.topProducts && statistics.inventory.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Остаток</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statistics.inventory.topProducts.slice(0, 10).map((product: TopProduct) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{product.stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{product.price.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{product.inventoryValue.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Товары не найдены</p>
          )}
        </div>
      </div>
    </div>
  );
}
