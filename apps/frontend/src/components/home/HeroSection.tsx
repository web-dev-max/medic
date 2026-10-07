'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const heroImages = [
  { src: '/hero.jpg', alt: 'Медицинское оборудование' },
  { src: '/hero2.jpg', alt: 'Стоматологическое оборудование' },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timeout);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleGetConsultation = () => {
    const contactsSection = document.getElementById('contacts-section');
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary-light">
      {/* ============ Background images layer ============ */}
      <div className="absolute inset-0 z-0">
        {/* ---- Desktop: фото в правой части, чуть заходит под туман ---- */}
        <div className="absolute inset-y-0 right-0 hidden w-[55%] lg:block">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide && !isTransitioning
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                quality={90}
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* ---- Mobile / tablet: тот же слайдер, но на всю ширину ---- */}
        <div className="absolute inset-0 block lg:hidden">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide && !isTransitioning
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                quality={85}
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* ---- Desktop: туман + размытие с мягким краем ---- */}
        <div
          className="pointer-events-none absolute inset-0 hidden bg-primary-light/75 lg:block"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage:
              'linear-gradient(to right, #000 0%, #000 45%, rgb(0 0 0 / 0.6) 50%, transparent 60%)',
            WebkitMaskImage:
              'linear-gradient(to right, #000 0%, #000 45%, rgb(0 0 0 / 0.6) 50%, transparent 60%)',
          }}
        />

        {/* ---- Mobile: заливка ---- */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-light/95 via-primary-light/80 to-primary-light/60 lg:hidden" />
      </div>

      {/* ============ Foreground content ============ */}
      <div className="container relative z-10 flex min-h-[420px] flex-col justify-between py-12 md:py-16 lg:min-h-[500px] lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Left column — text */}
          <div className="space-y-6">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              НАДЕЖНЫЙ ПАРТНЕР ДЛЯ ВАШЕЙ КЛИНИКИ
            </p>
            <h1 className="text-3xl font-bold leading-tight text-text-primary md:text-4xl lg:text-5xl">
              Медицинское и стоматологическое оборудование
            </h1>
            <p className="max-w-lg text-base text-text-secondary md:text-lg">
              Поставляем современное оборудование для клиник, стоматологий и
              лабораторий в Краснодаре и по всей России.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/catalog"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                Перейти в каталог
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={handleGetConsultation}
                className="btn btn-outline inline-flex items-center gap-2"
              >
                Получить консультацию
              </button>
            </div>
          </div>

          {/* Правая колонка пустая — там просвечивает фото */}
        </div>

        {/* Dots indicator */}
        <div className="mt-10 flex items-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'h-1.5 w-8 bg-primary'
                  : 'h-1.5 w-1.5 bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}