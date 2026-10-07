'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Truck } from 'lucide-react';
import Image from 'next/image';

export function WarrantyDeliverySection() {
  return (
    <section className="section bg-background-alt">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Warranty */}
          <div className="flex flex-col justify-between rounded-xl bg-primary p-8 text-white">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Гарантия</h3>
              <p className="text-sm text-white/80">
                На всё оборудование действует официальная гарантия от производителя.
                Мы несём ответственность за качество и надёжность поставленной продукции.
              </p>
            </div>
            <Link href="/warranty" className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90">
              Узнать подробнее
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Delivery */}
          <div className="flex flex-col justify-between rounded-xl bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-primary">Доставка</h3>
                <p className="text-sm text-text-muted">
                  Оперативная доставка по России и в Краснодаре. Работаем с проверенными транспортными компаниями, обеспечиваем сохранность оборудования.
                </p>
              </div>
              <div className="relative hidden h-32 w-full rounded-lg overflow-hidden md:block">
                <Image
                  src="https://images.unsplash.com/photo-1586528116116-27b4b46970dd?w=400&q=80"
                  alt="Доставка медицинского оборудования"
                  fill
                  sizes="300px"
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
            <Link href="/delivery" className="mt-6 inline-flex w-fit items-center gap-2 rounded-md border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
              Узнать подробнее
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
