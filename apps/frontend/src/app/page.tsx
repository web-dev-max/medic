import { type Metadata } from 'next';
import { HomePageContent } from '@/components/home/HomePageContent';

export const metadata: Metadata = {
  title: 'Медиком Плюс — Медицинское и стоматологическое оборудование',
  description:
    'Поставки современного медицинского и стоматологического оборудования для клиник, стоматологий и лабораторий в Краснодаре и по всей России. Официальные дилеры, гарантия, сервис.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Медиком Плюс — Медицинское и стоматологическое оборудование',
    description: 'Поставки современного медицинского и стоматологического оборудования.',
    type: 'website',
  },
  other: {
    'schema:description':
      'Компания Медиком Плюс — поставщик медицинского и стоматологического оборудования в Краснодаре и по всей России.',
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
