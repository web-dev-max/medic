'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loading, ErrorState } from '@/components/ui/Loading';
import { apiClient } from '@/lib/api/client';
import { ProductForm } from './ProductForm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseHtmlContent } from '@/lib/htmlUtils';
import { ImageWithPlaceholder } from '@/components/ui/ImageWithPlaceholder';

interface ProductClientProps {
  slug: string;
}

export function ProductClient({ slug }: ProductClientProps) {
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiClient.getProduct(slug),
  });

  const product =
    (productData as unknown as { items?: unknown[] })?.items?.[0] ||
    (productData as Record<string, unknown> | null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = ((product as Record<string, unknown>)?.images as string[]) || [];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const goToNext = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  if (isLoading) {
    return <Loading text="Загрузка товара..." />;
  }

  if (error || !product) {
    return (
      <ErrorState
        message="Товар не найден. Возможно, он был удалён или имеет другой URL."
        showBackButton
        className="py-24"
      />
    );
  }

  const productName = (product as Record<string, unknown>).name as string;
  const productBrand = (product as Record<string, unknown>).brand as { name?: string } | undefined;
  const productShortDescription = (product as Record<string, unknown>).shortDescription as
    | string
    | undefined;
  const productId = (product as Record<string, unknown>).id as number;
  const productPrice = (product as Record<string, unknown>).price as string;
  const productOldPrice = (product as Record<string, unknown>).oldPrice as string | undefined;
  const productSpecifications = (product as Record<string, unknown>).specifications as
    | Record<string, string>
    | undefined;
  const productDescription = (product as Record<string, unknown>).description as string | undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-background-alt">
          <ImageWithPlaceholder
            src={images[selectedImageIndex]}
            alt={`${productName} - изображение ${selectedImageIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="eager"
            className="object-contain p-4"
          />

          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-colors"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="h-5 w-5 text-text-primary" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-colors"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="h-5 w-5 text-text-primary" />
              </button>
              <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  index === selectedImageIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
                aria-label={`Показать изображение ${index + 1}`}
              >
                <ImageWithPlaceholder
                  src={img}
                  alt={`${productName} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {productBrand && <p className="text-sm text-text-muted">{productBrand.name}</p>}

        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{productName}</h1>

        {productShortDescription && (
          <p className="text-text-secondary">{productShortDescription}</p>
        )}

        <ProductForm
          productId={productId}
          productName={productName}
          price={parseFloat(productPrice)}
          oldPrice={productOldPrice ? parseFloat(productOldPrice) : undefined}
        />

        {productSpecifications && Object.keys(productSpecifications).length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Характеристики</h2>
            <div className="rounded-xl border border-border">
              {Object.entries(productSpecifications || {}).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm text-text-muted">{key}</span>
                  <span className="text-sm font-medium text-text-primary">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {productDescription && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Описание</h2>
            <div
              className="prose prose-sm max-w-none text-text-secondary"
              dangerouslySetInnerHTML={parseHtmlContent(productDescription)}
            />
          </div>
        )}
      </div>
    </div>
  );
}