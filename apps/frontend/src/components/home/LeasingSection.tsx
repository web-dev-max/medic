'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LeasingSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl bg-[rgb(232_244_248_/_0.2)] p-8">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="flex items-center gap-6">
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/20 lg:flex">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-text-primary md:text-2xl">
                  Лизинг оборудования
                </h3>
                <p className="text-sm text-text-muted max-w-lg">
                  Выгодные условия лизинга для клиник и медицинских центров.
                  Минимальный пакет документов, быстрое рассмотрение.
                </p>
              </div>
            </div>
            <Link href="/leasing" className="btn btn-outline shrink-0 sm:inline-flex">
              Рассчитать лизинг
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
