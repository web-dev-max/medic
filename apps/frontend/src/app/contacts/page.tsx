import { type Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CONTACT_INFO } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Контакты — Медиком Плюс',
  description: 'Контактная информация компании Медиком Плюс. Адрес, телефоны, email, режим работы.',
  alternates: {
    canonical: '/contacts',
  },
};

export default function ContactsPage() {
  return (
    <div className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Контакты' }]} />

        <h1 className="mb-8 text-3xl font-bold text-text-primary md:text-4xl">
          Контакты
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text-primary">Адрес</h3>
                <p className="text-text-muted">{CONTACT_INFO.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text-primary">Телефон</h3>
                <div className="flex flex-col gap-1">
                  {CONTACT_INFO.phones.map((phone, i) => (
                    <a
                      key={i}
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-text-muted hover:text-primary"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-1">{CONTACT_INFO.workHours}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text-primary">Email</h3>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-text-muted hover:text-primary"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-background-alt h-[300px] lg:h-auto">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=38.9753%2C45.0355&z=13&pt=38.9753,45.0355/pm/roundpoint"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0"
              title="Карта"
            />
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
