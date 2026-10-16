import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ServiceForm } from './ServiceForm';
import {
  InfoSection,
  HighlightBox,
} from '@/components/ui/InfoPage';
import { Settings, MessageCircle, ClipboardCheck, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Сервис — Медиком Плюс',
  description: 'Сервисное обслуживание, ремонт и гарантийное обслуживание медицинского оборудования.',
  alternates: {
    canonical: '/service',
  },
};

export default function ServicePage() {
  const services = [
    { icon: ClipboardCheck, label: 'Плановое техническое обслуживание' },
    { icon: Wrench, label: 'Ремонт и настройка оборудования' },
    { icon: Settings, label: 'Гарантийное обслуживание' },
    { icon: MessageCircle, label: 'Замена расходных материалов и запчастей' },
    { icon: MessageCircle, label: 'Консультации специалистов' },
  ];

  return (
    <div className="section">
      <div className="container max-w-5xl">
        <Breadcrumbs items={[{ label: 'Сервис' }]} />

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          Сервисное обслуживание
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-text-secondary">
          Компания «Медиком Плюс» предлагает полный спектр сервисных услуг для медицинского
          и стоматологического оборудования.
        </p>

        <div className="space-y-8">
          {/* Services list */}
          <InfoSection
            title="Наши услуги"
            icon={<Wrench className="h-5 w-5 text-primary" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="flex items-start gap-3 rounded-lg bg-background-alt p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-text-secondary md:text-base">{service.label}</span>
                  </div>
                );
              })}
            </div>
          </InfoSection>

          {/* Highlight */}
          <HighlightBox>
            <p className="flex items-start gap-2">
              <span className="shrink-0 text-xl">💡</span>
              <span>
                Наши квалифицированные инженеры обеспечивают оперативный выезд и качественное обслуживание
                вашего оборудования.
              </span>
            </p>
          </HighlightBox>

          {/* Service form */}
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
