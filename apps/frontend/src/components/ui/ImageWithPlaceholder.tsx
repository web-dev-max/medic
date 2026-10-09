'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';

interface ImageWithPlaceholderProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  width?: number;
  height?: number;
  // Для карточек каталога
  style?: React.CSSProperties;
}

/**
 * Компонент изображения с автоматической заглушкой при ошибках
 * Используется во всех местах отображения товаров и категорий
 */
export function ImageWithPlaceholder({
  src,
  alt,
  className = '',
  fill = false,
  sizes,
  loading = 'lazy',
  placeholder,
  blurDataURL,
  width,
  height,
  style,
}: ImageWithPlaceholderProps) {
  const [hasError, setHasError] = useState(false);

  // Проверяем, является ли src пустым или недопустимым
  const isValidSrc =
    src && src.trim() !== '' && !src.includes('undefined') && !src.includes('null');

  // Используем заглушку, если src невалидный
  const imageSrc = isValidSrc ? src : null;

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Заглушка для отсутствующих изображений
  if (!imageSrc || hasError) {
    return (
      <div
        className={[
          'flex flex-col items-center justify-center bg-gray-100 text-gray-400',
          fill ? 'absolute inset-0 h-full w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        aria-label={alt}
        role="img"
      >
        {fill ? (
          <>
            <ImageIcon className="h-12 w-12 shrink-0 sm:h-16 sm:w-16 md:h-20 md:w-20" />
          </>
        ) : (
          <>
            <Camera className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
          </>
        )}
      </div>
    );
  }

  // Рендерим реальное изображение
  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleError}
        unoptimized
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      width={width}
      height={height}
      onError={handleError}
    />
  );
}