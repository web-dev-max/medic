'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '../ui/ToastProvider';

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image?: string;
  brand?: string;
  category?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  oldPrice,
  image,
  brand,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { showToast } = useToast();

  // Check if product is in cart
  const cartItem = items.find((item) => item.id === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  const formatPrice = (p: number) => {
    if (p <= 0) {
      return 'Уточните цену, обратившись по заявке';
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  const handleAddToCart = () => {
    if (price <= 0) {
      return; // Prevent adding zero-price items
    }

    addItem({
      id,
      name,
      slug,
      price,
      image: image || '',
    });
    showToast(`«${name}» добавлен в корзину`, 'success');
  };

  const handleIncrease = () => {
    if (price <= 0) return;
    useCartStore.getState().updateQuantity(id, cartQuantity + 1);
  };

  const handleDecrease = () => {
    if (price <= 0) return;
    if (cartQuantity <= 1) {
      // Remove from cart when quantity goes to 0
      useCartStore.getState().removeItem(id);
    } else {
      useCartStore.getState().updateQuantity(id, cartQuantity - 1);
    }
  };

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-white transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      {/* Image */}
      <Link href={`/product/${encodeURIComponent(slug)}`} className="relative block aspect-square overflow-hidden rounded-t-xl bg-background-alt">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"  // Lazy load images below the fold
            placeholder="blur"  // Blur up effect while loading
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <div className="h-16 w-16 rounded-full bg-border/50" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {brand && (
          <p className="mb-1 text-xs text-text-muted">{brand}</p>
        )}
        <Link href={`/product/${encodeURIComponent(slug)}`}>
          <h3 className="mb-2 text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          {/* Price */}
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">
              {formatPrice(price)}
            </span>
            {oldPrice && oldPrice > price && price > 0 && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>

          {/* Cart Controls */}
          <div className="flex gap-2">
            <Link
              href={`/product/${encodeURIComponent(slug)}`}
              className="btn btn-primary flex-1 text-sm px-3 py-2"
            >
              Подробнее
            </Link>

            {price <= 0 ? (
              /* Zero price - show "Request Price" button */
              <Link
                href={`/product/${encodeURIComponent(slug)}`}
                className="btn btn-outline flex-1 text-sm px-3 py-2"
                title="Уточните цену, обратившись по заявке"
              >
                <ShoppingCart className="h-4 w-4" />
                Запросить
              </Link>
            ) : isInCart ? (
              /* In cart - show quantity controls */
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={handleDecrease}
                  title="Уменьшить количество"
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {cartQuantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={handleIncrease}
                  title="Увеличить количество"
                >
                  +
                </Button>
              </div>
            ) : (
              /* Not in cart - show add to cart button */
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={handleAddToCart}
                title="Добавить в заявку"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
