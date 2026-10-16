import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CartContent } from './CartContent';

export const metadata: Metadata = {
  title: 'Корзина — Медиком Плюс',
  description: 'Оформление заявки на товары из корзины.',
  alternates: {
    canonical: '/cart',
  },
};

export default function CartPage() {
  return (
    <div className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Корзина' }]} />

        <h1 className="mb-8 text-2xl font-bold text-text-primary md:text-3xl">
          Корзина
        </h1>

        <CartContent />
      </div>
    </div>
  );
}
