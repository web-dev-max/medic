import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactForm } from './ContactForm';
import {
  InfoSection,
  InfoCard,
  InfoList,
  InfoListItem,
} from '@/components/ui/InfoPage';
import { Award, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'О компании — Медиком Плюс',
  description: 'Компания Медиком Плюс — поставщик медицинского и стоматологического оборудования в Краснодаре и по всей России.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="section">
      <div className="container max-w-5xl">
        <Breadcrumbs items={[{ label: 'О компании' }]} />

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          О компании
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-text-secondary">
          Компания «Медиком Плюс» — надёжный поставщик медицинского и стоматологического оборудования
          в Краснодаре и по всей России. Мы работаем напрямую с ведущими производителями,
          что позволяет предлагать нашим клиентам современное оборудование по выгодным ценам.
        </p>

        <div className="space-y-8">
          {/* Mission */}
          <InfoSection
            title="Наша миссия"
            icon={<Award className="h-5 w-5 text-primary" />}
          >
            <p className="text-text-secondary">
              Мы помогаем медицинским учреждениям оснащать современные клиники и лаборатории
              качественным оборудованием, обеспечивая полный цикл услуг — от подбора до сервисного обслуживания.
            </p>
          </InfoSection>

          {/* Advantages */}
          <InfoSection
            title="Наши преимущества"
            icon={<Shield className="h-5 w-5 text-primary" />}
          >
            <InfoList>
              <InfoListItem>Прямые контракты с производителями</InfoListItem>
              <InfoListItem>Официальная гарантия на всё оборудование</InfoListItem>
              <InfoListItem>Собственный сервисный центр</InfoListItem>
              <InfoListItem>Доставка по всей России</InfoListItem>
              <InfoListItem>Профессиональная консультация и подбор оборудования</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* Why choose us - cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard title="Официальные поставки" variant="highlight">
              <p className="text-sm text-text-secondary">Прямые контракты с производителями</p>
            </InfoCard>
            <InfoCard title="Гарантия" variant="highlight">
              <p className="text-sm text-text-secondary">Официальная гарантия на всё оборудование</p>
            </InfoCard>
            <InfoCard title="Сервисное обслуживание" variant="highlight">
              <p className="text-sm text-text-secondary">Собственный сервисный центр и выездные инженеры</p>
            </InfoCard>
            <InfoCard title="Доставка по России" variant="highlight">
              <p className="text-sm text-text-secondary">Бережная и надёжная доставка в любой регион</p>
            </InfoCard>
            <InfoCard title="Помощь в подборе" variant="highlight">
              <p className="text-sm text-text-secondary">Проконсультируем и подберём оптимальное решение</p>
            </InfoCard>
          </div>

          {/* Contact form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
