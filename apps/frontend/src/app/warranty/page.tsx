import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  InfoSection,
  InfoCard,
  InfoNumberedList,
  InfoList,
  InfoListItem,
  HighlightBox,
} from '@/components/ui/InfoPage';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Гарантия — Медиком Плюс',
  description: 'Гарантийные условия, сроки, ограничения и порядок обращения по гарантии на медицинское оборудование.',
  alternates: {
    canonical: '/warranty',
  },
};

export default function WarrantyPage() {
  return (
    <div className="section">
      <div className="container max-w-5xl">
        <Breadcrumbs items={[{ label: 'Гарантия' }]} />

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          Гарантийное обслуживание
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-text-secondary">
          Компания «Медиком Плюс» предоставляет официальную гарантию производителя на всё
          поставляемое медицинское и стоматологическое оборудование.
        </p>

        <div className="space-y-8">
          {/* Warranty terms */}
          <InfoSection
            title="Гарантийные условия"
            icon={<Shield className="h-5 w-5 text-primary" />}
          >
            <p className="text-text-secondary">
              Мы несём ответственность за качество и надёжность поставленной продукции.
              Гарантийные условия определяются производителем и указаны в гарантийном талоне.
            </p>
          </InfoSection>

          {/* Warranty periods */}
          <InfoSection
            title="Сроки гарантии"
            icon={<FileText className="h-5 w-5 text-primary" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Стоматологические установки">
                <p className="text-2xl font-bold text-primary">12–36 месяцев</p>
              </InfoCard>
              <InfoCard title="Стерилизационное оборудование">
                <p className="text-2xl font-bold text-primary">12–24 месяца</p>
              </InfoCard>
              <InfoCard title="Рентгеновское оборудование">
                <p className="text-2xl font-bold text-primary">12–24 месяца</p>
              </InfoCard>
              <InfoCard title="Расходные материалы">
                <p className="text-sm text-text-secondary">Согласно спецификации производителя</p>
              </InfoCard>
            </div>
          </InfoSection>

          {/* What's included */}
          <InfoSection
            title="Что включает гарантия"
            icon={<Shield className="h-5 w-5 text-primary" />}
          >
            <InfoList>
              <InfoListItem>Бесплатный ремонт оборудования</InfoListItem>
              <InfoListItem>Замену неисправных деталей</InfoListItem>
              <InfoListItem>Выезд сервисного инженера</InfoListItem>
              <InfoListItem>Консультации по эксплуатации</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* How to contact */}
          <InfoSection
            title="Порядок обращения"
            icon={<FileText className="h-5 w-5 text-primary" />}
          >
            <InfoNumberedList>
              <span>Свяжитесь с нами по телефону или электронной почте</span>
              <span>Сообщите номер заказа, модель и серийный номер оборудования</span>
              <span>Опишите проблему или неисправность</span>
              <span>Наш специалист проведёт диагностику и предложит решение</span>
            </InfoNumberedList>
          </InfoSection>

          {/* Required documents */}
          <InfoSection
            title="Необходимые документы"
            icon={<FileText className="h-5 w-5 text-primary" />}
          >
            <InfoList>
              <InfoListItem>Гарантийный талон</InfoListItem>
              <InfoListItem>Договор купли-продажи или счёт-фактура</InfoListItem>
              <InfoListItem>Акт ввода оборудования в эксплуатацию (при наличии)</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* Warranty exclusions */}
          <InfoSection
            title="Гарантия не распространяется на"
            icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          >
            <InfoList>
              <InfoListItem>Повреждения, вызванные неправильной эксплуатацией</InfoListItem>
              <InfoListItem>Поломки, вызванные действиями третьих лиц</InfoListItem>
              <InfoListItem>Расходные материалы</InfoListItem>
              <InfoListItem>Повреждения, вызванные форс-мажорными обстоятельствами</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* Highlight */}
          <HighlightBox>
            <p className="flex items-start gap-2">
              <span className="shrink-0 text-xl">📞</span>
              <span>
                Для получения гарантийного обслуживания свяжитесь с нами по телефону{' '}
                <strong>+7 (918) 417-17-77</strong> или по электронной почте{' '}
                <strong>medikom_plus@mail.ru</strong>
              </span>
            </p>
          </HighlightBox>
        </div>
      </div>
    </div>
  );
}
