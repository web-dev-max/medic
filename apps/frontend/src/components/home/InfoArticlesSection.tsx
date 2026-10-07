'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const articles = [
  {
    id: 1,
    title: 'Как выбрать стоматологическое оборудование для клиники',
    excerpt: 'На что обратить внимание при выборе и какие параметры важны.',
    date: '12 мая 2025',
    type: 'Статья',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80',
  },
  {
    id: 2,
    title: 'Новинки медицинского оборудования',
    excerpt: 'Обзор новых моделей и технологий в 2025 году.',
    date: '5 мая 2025',
    type: 'Новости',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
  },
  {
    id: 3,
    title: 'Полезные материалы и инструкции',
    excerpt: 'Документы, инструкции, советы и рекомендации.',
    date: '28 апреля 2025',
    type: 'Полезное',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb19e7f4?w=400&q=80',
  },
];

export function InfoArticlesSection() {
  return (
    <section className="section bg-background-alt">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
            Полезная информация
          </h2>
          <Link href="/catalog" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            Все статьи
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay gradient for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <span className="mb-2 inline-block text-xs font-medium text-primary uppercase tracking-wider">
                {article.type}
              </span>
              <h3 className="mb-2 text-base font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="mb-3 text-sm text-text-muted line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{article.date}</span>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
