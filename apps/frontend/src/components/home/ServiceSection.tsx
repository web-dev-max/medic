'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Settings, MessageCircle, Wrench } from 'lucide-react';
import Image from 'next/image';

const services = [
  { icon: ClipboardCheck, label: 'Плановое обслуживание' },
  { icon: Wrench, label: 'Ремонт и настройка' },
  { icon: MessageCircle, label: 'Консультации специалистов' },
  { icon: Settings, label: 'Оригинальные запчасти' },
];

export function ServiceSection() {
  return (
    <section className="section">
      <div className="container rounded-xl bg-[rgb(232_244_248_/_0.2)] px-4 py-6 sm:px-6 lg:py-0">
        <div className="grid items-center gap-4 lg:grid-cols-2">
          {/* Image */}
          <div className="relative hidden w-3/4 overflow-hidden rounded-l-xl lg:block">
            <div className="relative h-[320px] w-full">
              <Image
                src="/service.jpg"
                alt="Сервисное обслуживание"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-start lg:gap-8 lg:-ml-24">
            <div className="space-y-3 lg:flex-[1.8]">
              <h2 className="mb-2 text-2xl font-bold text-text-primary md:mb-4 md:text-3xl">
                Сервис и техническое обслуживание
              </h2>
              <p className="text-text-secondary">
                Квалифицированные инженеры, оперативный выезд, оригинальные запчасти и расходные материалы.
              </p>
              <Link
                href="/service"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                Подробнее
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3 lg:flex-1">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-text-secondary">{service.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}