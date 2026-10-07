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
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Image with visual effects */}
          <div className="relative rounded-xl overflow-hidden shadow-lg hidden lg:block">
            <div className="relative h-[320px] w-full">
              <Image
                src="/service.jpg"
                alt="Сервисное обслуживание"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              {/* Subtle gradient overlay at top for visual cohesion */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-light/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-text-primary md:text-3xl">
              Сервис и техническое обслуживание
            </h2>
            <p className="mb-6 text-text-secondary">
              Квалифицированные инженеры, оперативный выезд, оригинальные запчасти и расходные материалы.
            </p>

            <div className="mb-6 space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-text-secondary">{service.label}</span>
                  </div>
                );
              })}
            </div>

            <Link href="/service" className="btn btn-primary inline-flex items-center gap-2">
              Подробнее
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
