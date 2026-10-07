'use client';

import { Shield, Award, Wrench, Truck, UserCheck } from 'lucide-react';

const advantages = [
  {
    icon: Shield,
    title: 'Официальные поставки',
    description: 'Прямые контракты с производителями',
  },
  {
    icon: Award,
    title: 'Гарантия',
    description: 'Официальная гарантия на всё оборудование',
  },
  {
    icon: Wrench,
    title: 'Сервисное обслуживание',
    description: 'Собственный сервисный центр и выездные инженеры',
  },
  {
    icon: Truck,
    title: 'Доставка по России',
    description: 'Бережная и надёжная доставка в любой регион',
  },
  {
    icon: UserCheck,
    title: 'Помощь в подборе оборудования',
    description: 'Проконсультируем и подберём оптимальное решение',
  },
];

export function AdvantagesSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="mb-10 text-left text-2xl font-bold text-text-primary md:text-3xl">
          Почему выбирают МедикомПлюс
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center rounded-xl bg-[rgb(232_244_248_/_0.2)] p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary">
                  {advantage.title}
                </h3>
                <p className="text-sm text-text-muted">{advantage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
