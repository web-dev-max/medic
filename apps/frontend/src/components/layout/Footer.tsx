'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from '@/lib/api/hooks';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function Footer() {
  const { data: categoriesData, isLoading, error } = useCategories();
  const categories = (categoriesData as Category[] | undefined) || [];
  
  // Get first 8 categories for display
  const catalogCategories = categories.slice(0, 8);

  const clientLinks = [
    { label: 'Сервис', href: '/service' },
    { label: 'Гарантия', href: '/warranty' },
    { label: 'Доставка', href: '/delivery' },
    { label: 'Лизинг', href: '/leasing' },
    { label: 'Контакты', href: '/contacts' },
  ];

  const infoLinks = [
    { label: 'О компании', href: '/about' },
//     { label: 'Реквизиты', href: '/about' },
  ];

  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & description */}
          <div>
            <div className="bg-[rgb(255_255_255_/_1)] rounded-sm shadow-smrelative flex items-center gap-2 mb-4">
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">МедикомПлюс</div>
                <div className="text-xs text-footer-text">Медицинское оборудование</div>
              </div> */}
              <Image
                src="/logo_medic.png"
                alt="МедикомПлюс — медицинское оборудование"
                width={300}
                height={300}
                className="object-contain object-left"
                priority
              />
            </div>
            <p className="text-sm text-footer-text/80 mb-4">
              Современные решения для здоровья людей
            </p>
            <div className="flex gap-3">
              {/* Social icons placeholders */}
              <a href="https://vk.com/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold text-white">VK</span>
              </a>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold text-white">TG</span>
              </a>
              <a href="https://ok.ru/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold text-white">OK</span>
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Каталог</h4>
            <ul className="space-y-2">
              {isLoading ? (
                <li className="text-sm text-footer-text/60">Загрузка...</li>
              ) : error || catalogCategories.length === 0 ? (
                <li>
                  <Link href="/catalog" className="text-sm text-footer-text/80 hover:text-white transition-colors">
                    Все категории
                  </Link>
                </li>
              ) : (
                catalogCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/catalog?categoryId=${category.id}`}
                      className="text-sm text-footer-text/80 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
              <li>
                <Link href="/catalog" className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                  Все категории →
                </Link>
              </li>
            </ul>
          </div>

          {/* Clients */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Клиентам</h4>
            <ul className="space-y-2">
              {clientLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-footer-text/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Информация</h4>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-footer-text/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy-policy" className="text-sm text-footer-text/80 hover:text-white transition-colors">
                  Политика обработки персональных данных
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-footer-text/60 md:flex-row">
            <span>© {new Date().getFullYear()} МедикомПлюс. Все права защищены.</span>
            <span>Медицинское и стоматологическое оборудование в Краснодаре</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
