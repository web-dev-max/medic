import { type Metadata } from 'next';
import { CatalogPage } from '@/components/catalog/CatalogPage';

export const metadata: Metadata = {
  title: 'Каталог — Медицинское и стоматологическое оборудование',
  description: 'Полный каталог медицинского и стоматологического оборудования. Стоматологические установки, стерилизационное оборудование, рентгенодиагностика и многое другое.',
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    title: 'Каталог — Медиком Плюс',
    description: 'Полный каталог медицинского и стоматологического оборудования.',
  },
};

export default function CatalogPageRoute() {
  return <CatalogPage />;
}
