import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  InfoSection,
  InfoCard,
  InfoList,
  InfoListItem,
  HighlightBox,
} from '@/components/ui/InfoPage';
import { MapPin, Package, Clock, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Доставка — Медиком Плюс',
  description: 'Условия доставки медицинского оборудования по Краснодару и всей России.',
  alternates: {
    canonical: '/delivery',
  },
};

export default function DeliveryPage() {
  return (
    <div className="section">
      <div className="container max-w-5xl">
        <Breadcrumbs items={[{ label: 'Доставка' }]} />

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          Доставка
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-text-secondary">
          Мы осуществляем доставку медицинского оборудования по Краснодару и всей России.
          Работаем с проверенными транспортными компаниями и собственным транспортным отделом.
        </p>

        <div className="space-y-8">
          {/* Krasnodar delivery */}
          <InfoSection
            title="Доставка по Краснодару"
            icon={<MapPin className="h-5 w-5 text-primary" />}
          >
            <p className="text-text-secondary">
              Доставка осуществляется собственным транспортным отделом или с привлечением
              проверенных транспортных компаний. Бережная упаковка и подъём на этаж.
            </p>
          </InfoSection>

          {/* Russia delivery */}
          <InfoSection
            title="Доставка по России"
            icon={<Truck className="h-5 w-5 text-primary" />}
          >
            <p className="text-text-secondary mb-4">
              Доставка по всей России осуществляется транспортными компаниями:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard title="СДЭК" variant="highlight" />
              <InfoCard title="Деловые Линии" variant="highlight" />
              <InfoCard title="ПЭК" variant="highlight" />
            </div>
          </InfoSection>

          {/* Delivery conditions */}
          <InfoSection
            title="Условия доставки"
            icon={<Package className="h-5 w-5 text-primary" />}
          >
            <InfoList>
              <InfoListItem>Бережная упаковка оборудования</InfoListItem>
              <InfoListItem>Страхование груза</InfoListItem>
              <InfoListItem>Доставка до двери или до терминала ТК</InfoListItem>
              <InfoListItem>Подъём на этаж</InfoListItem>
              <InfoListItem>Распаковка и осмотр оборудования</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* Delivery cost */}
          <InfoSection
            title="Стоимость доставки"
            icon={<Truck className="h-5 w-5 text-primary" />}
          >
            <p className="text-text-secondary">
              Стоимость доставки рассчитывается индивидуально в зависимости от габаритов,
              веса оборудования и расстояния. При крупных заказах доставка может быть бесплатной.
            </p>
          </InfoSection>

          {/* Delivery terms */}
          <InfoSection
            title="Сроки доставки"
            icon={<Clock className="h-5 w-5 text-primary" />}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard title="По Краснодару">
                <p className="text-2xl font-bold text-primary">1–3 дня</p>
                <p className="text-xs text-text-muted">рабочих дней</p>
              </InfoCard>
              <InfoCard title="По Краснодарскому краю">
                <p className="text-2xl font-bold text-primary">2–5 дней</p>
                <p className="text-xs text-text-muted">рабочих дней</p>
              </InfoCard>
              <InfoCard title="По России">
                <p className="text-2xl font-bold text-primary">3–14 дней</p>
                <p className="text-xs text-text-muted">в зависимости от региона</p>
              </InfoCard>
            </div>
          </InfoSection>

          {/* Highlight */}
          <HighlightBox>
            <p className="flex items-start gap-2">
              <span className="shrink-0 text-xl">📦</span>
              <span>
                Все грузы страхуются. Обеспечиваем бережную упаковку и сохранность оборудования
                при транспортировке.
              </span>
            </p>
          </HighlightBox>
        </div>
      </div>
    </div>
  );
}
