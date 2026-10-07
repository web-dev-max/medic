'use client';

import { CONTACT_INFO } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';

export function ContactsSection() {
  return (
    <section id="contacts-section" className="section">
      <div className="container">
        <h2 className="mb-8 text-2xl font-bold text-text-primary md:text-3xl">
          Контакты
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Адрес</h4>
                <p className="text-sm text-text-muted">{CONTACT_INFO.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Телефон</h4>
                <div className="flex flex-col gap-1">
                  {CONTACT_INFO.phones.map((phone, i) => (
                    <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm text-text-muted hover:text-primary">
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
                <h4 className="font-semibold text-text-primary">Email</h4>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-text-muted hover:text-primary">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="relative rounded-xl overflow-hidden bg-background-alt h-[400px] lg:h-auto">
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
      </div>
    </section>
  );
}
