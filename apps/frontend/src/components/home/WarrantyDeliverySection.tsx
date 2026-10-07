'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Truck } from 'lucide-react';
import Image from 'next/image';

export function WarrantyDeliverySection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Warranty */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-warranty-bg bg-[url('/warranty.png')] bg-cover bg-left p-8 text-white md:bg-center">
            <div className="absolute inset-0 bg-warranty-bg/70" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Гарантия</h3>
                <p className="text-md text-white/80">
                  На всё оборудование действует официальная гарантия от производителя.
                  Мы несём ответственность за качество и надёжность поставленной продукции.
                </p>
              </div>
              <Link
                href="/warranty"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Узнать подробнее
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex flex-col justify-between rounded-xl bg-[rgb(232_244_248_/_0.4)] p-8 shadow-sm">
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

              <div className="relative hidden h-full min-h-[200px] w-full overflow-hidden rounded-lg bg-[url('/delivery.png')] bg-cover bg-center md:block">
                <div className="absolute inset-0 bg-primary-light/60" />
              </div>
            </div>

            <Link
              href="/delivery"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-md border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Узнать подробнее
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
