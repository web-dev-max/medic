import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { PageLayout } from '@/components/layout/PageLayout';

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Медиком Плюс — Медицинское и стоматологическое оборудование',
    template: '%s — Медиком Плюс',
  },
  description:
    'Поставки современного медицинского и стоматологического оборудования для клиник, стоматологий и лабораторий в Краснодаре и по всей России. Официальные дилеры, гарантия, сервис.',
  keywords: [
    'медицинское оборудование',
    'стоматологическое оборудование',
    'стоматологические установки',
    'стерилизационное оборудование',
    'рентгенодиагностика',
    'компрессоры',
    'лабораторное оборудование',
    'Медиком Плюс',
    'Краснодар',
  ],
  icons: {
    icon: [
      { url: '/logo_medic.png', type: 'image/png' },
    ],
    shortcut: '/logo_medic.png',
    apple: '/logo_medic.png',
  },
  alternates: {
    canonical: 'https://medikomplus.ru',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Медиком Плюс',
    title: 'Медиком Плюс — Медицинское и стоматологическое оборудование',
    description:
      'Поставки современного медицинского и стоматологического оборудования для клиник, стоматологий и лабораторий.',
    images: [
      {
        url: '/logo_medic.png',
        height: 630,
        alt: 'Медиком Плюс',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Медиком Плюс',
    description: 'Медицинское и стоматологическое оборудование',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans text-text-primary bg-background antialiased">
        <Providers>
          <PageLayout>{children}</PageLayout>
        </Providers>
      </body>
    </html>
  );
}