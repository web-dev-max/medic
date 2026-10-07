import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LeasingForm } from './LeasingForm';
import {
  InfoSection,
  InfoCard,
  InfoNumberedList,
  InfoList,
  InfoListItem,
  HighlightBox,
} from '@/components/ui/InfoPage';
import { DollarSign, FileText, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Лизинг — Медиком Плюс',
  description: 'Выгодные условия лизинга медицинского оборудования для клиник и медицинских центров.',
  alternates: {
    canonical: '/leasing',
  },
};

export default function LeasingPage() {
  return (
    <div className="section">
      <div className="container max-w-5xl">
        <Breadcrumbs items={[{ label: 'Лизинг' }]} />

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          Лизинг оборудования
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-text-secondary">
          Компания «Медиком Плюс» предлагает выгодные условия лизинга медицинского и
          стоматологического оборудования для клиник и медицинских центров.
        </p>

        <div className="space-y-8">
          {/* Advantages */}
          <InfoSection
            title="Преимущества лизинга"
            icon={<DollarSign className="h-5 w-5 text-primary" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Минимальный взнос" variant="highlight">
                <p className="text-sm text-text-secondary">Минимальный первоначальный взнос</p>
              </InfoCard>
              <InfoCard title="Гибкие условия" variant="highlight">
                <p className="text-sm text-text-secondary">Гибкие условия оплаты</p>
              </InfoCard>
              <InfoCard title="Быстрое рассмотрение" variant="highlight">
                <p className="text-sm text-text-secondary">Быстрое рассмотрение заявки</p>
              </InfoCard>
              <InfoCard title="Без крупных платежей" variant="highlight">
                <p className="text-sm text-text-secondary">Отсутствие необходимости в крупных единовременных платежах</p>
              </InfoCard>
              <InfoCard title="Досрочное погашение" variant="highlight">
                <p className="text-sm text-text-secondary">Возможность досрочного погашения</p>
              </InfoCard>
            </div>
          </InfoSection>

          {/* How to order */}
          <InfoSection
            title="Как оформить лизинг"
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          >
            <InfoNumberedList>
              <span>Выберите оборудование в каталоге</span>
              <span>Оставьте заявку на лизинг</span>
              <span>Наш менеджер свяжется с вами для уточнения деталей</span>
              <span>Подпишите договор и получите оборудование</span>
            </InfoNumberedList>
          </InfoSection>

          {/* Required documents */}
          <InfoSection
            title="Необходимые документы"
            icon={<FileText className="h-5 w-5 text-primary" />}
          >
            <InfoList>
              <InfoListItem>Заявка на лизинг</InfoListItem>
              <InfoListItem>Регистрационные документы организации</InfoListItem>
              <InfoListItem>Финансовая отчётность</InfoListItem>
              <InfoListItem>Дополнительные документы по запросу</InfoListItem>
            </InfoList>
          </InfoSection>

          {/* Highlight */}
          <HighlightBox>
            <p className="flex items-start gap-2">
              <span className="shrink-0 text-xl">💡</span>
              <span>
                Лизинг — выгодная альтернатива покупке в кредит. Вы получаете оборудование сразу,
                а оплата происходит постепенно в рамках согласованного графика.
              </span>
            </p>
          </HighlightBox>

          {/* Leasing form */}
          <LeasingForm />
        </div>
      </div>
    </div>
  );
}
