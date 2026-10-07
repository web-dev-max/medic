'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Search, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { CONTACT_INFO } from '@/lib/constants';
import { useCartStore } from '@/stores/cartStore';
import { SearchAutocomplete } from '../catalog/SearchAutocomplete';
import { apiClient } from '@/lib/api/client';

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const pathname = usePathname();
  const isCartPage = pathname === '/cart';
  const totalItems = useCartStore((state) => state.totalItems());
  const hasPendingAnimation = useCartStore((state) => state.hasPendingAnimation);

  // Determine active nav item
  const getActiveNavItem = (href: string) => {
    if (pathname === href) return 'current';
    // For sub-pages, check if pathname starts with href
    if (pathname?.startsWith(href)) return 'current';
    return undefined;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { label: 'О компании', href: '/about' },
    { label: 'Сервис', href: '/service' },
    { label: 'Гарантия', href: '/warranty' },
    { label: 'Доставка', href: '/delivery' },
    { label: 'Лизинг', href: '/leasing' },
    { label: 'Контакты', href: '/contacts' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      {/* Top bar */}
      <div className="hidden border-b border-border bg-background-alt md:block">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="font-medium text-text-primary">{CONTACT_INFO.address}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>Пн–Пт 09:00–18:00</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {CONTACT_INFO.phones.map((phone, i) => (
              <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            ))}
            <button
              className="ml-2 text-primary hover:underline"
              onClick={() => setCallbackModalOpen(true)}
            >
              Обратный звонок
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="relative flex h-14 w-52 shrink-0 items-center sm:h-16 sm:w-60">
            <Image
              src="/logo_medic.png"
              alt="МедикомПлюс — медицинское оборудование"
              fill
              sizes="(max-width: 640px) 160px, 192px"
              className="object-contain object-left"
              priority
            />
          </a>

          {/* Search */}
          <div className="hidden flex-1 max-w-xl mx-4 md:block">
            <SearchAutocomplete />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a href="/cart" className="flex flex-col items-center gap-0.5 text-text-secondary hover:text-primary transition-colors relative">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && !isCartPage && (
                  <span className={cn(
                    "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-sm",
                    hasPendingAnimation && "animate-bounce"
                  )}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs">Корзина</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <form action="/search" className="relative">
            <input
              name="q"
              type="text"
              placeholder="Поиск..."
              className="w-full rounded-lg border border-border py-2.5 pl-4 pr-12 text-sm"
            />
            <button className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-text-muted">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Navigation */}
      <div className="hidden border-t border-border md:block">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-2 md:justify-start">
            {/* Catalog button */}
            <a href="/catalog" className="shrink-0">
              <Button variant="primary" size="sm" className="rounded-r-none">
                <Menu className="mr-2 h-4 w-4" />
                Каталог
              </Button>
            </a>

            {navItems.map((item) => {
              const isActive = getActiveNavItem(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'whitespace-nowrap px-4 py-2 text-sm transition-colors',
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-text-secondary hover:text-primary'
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="container py-4">
            <nav className="flex flex-col gap-1">
              <a href="/catalog" className="px-3 py-2 text-base font-medium text-text-primary hover:bg-background-alt rounded-md">
                Каталог
              </a>
              {navItems.map((item) => {
                const isActive = getActiveNavItem(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-base transition-colors rounded-md',
                      isActive
                        ? 'font-medium text-primary bg-primary-light/30'
                        : 'text-text-secondary hover:bg-background-alt'
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Callback Modal */}
      {callbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCallbackModalOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-primary">Обратный звонок</h3>
              <button onClick={() => setCallbackModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
              Оставьте ваш номер телефона и мы перезвоним вам в ближайшее время.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const phone = formData.get('phone') as string;
                try {
                  await apiClient.submitGeneralRequest({ name, phone, email: '', message: '' });
                  setCallbackModalOpen(false);
                } catch {
                  alert('Ошибка отправки. Пожалуйста, позвоните нам.');
                }
              }}
              className="space-y-4"
            >
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                name="phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" className="w-full">
                Перезвоните мне
              </Button>
            </form>
            <p className="mt-3 text-xs text-text-muted">
              Или позвоните: {CONTACT_INFO.phones.map((p, i) => <span key={i}>{i > 0 ? ' / ' : ''}{p}</span>)}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
