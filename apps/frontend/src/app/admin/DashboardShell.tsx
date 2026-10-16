'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.split('=');
    if (cookieName === name) {
      return cookieValueParts.join('=');
    }
  }
  return null;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth once on mount
  useEffect(() => {
    const t = getCookie('admin_token');
    setToken(t);
    setChecking(false);
  }, []);

  // Update isAuthenticated state when token changes
  useEffect(() => {
    if (!checking) {
      setIsAuthenticated(!!token);
    }
  }, [checking, token]);

  // Redirect if not authenticated and not on login page
  useEffect(() => {
    if (!checking && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [checking, isAuthenticated, pathname, router]);

  const handleLogout = useCallback(() => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  }, [router]);

  const navItems = useMemo(() => [
    { href: '/admin', label: 'Панель управления', icon: '📊' },
    { href: '/admin/products', label: 'Товары', icon: '📦' },
    { href: '/admin/categories', label: 'Категории', icon: '📁' },
    { href: '/admin/brands', label: 'Бренды', icon: '🏭' },
    { href: '/admin/content', label: 'Страницы', icon: '📄' },
  ], []);

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Allow login page to render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-400">Medikom Plus</h1>
            <p className="text-sm text-gray-400">Панель управления</p>
          </div>
          
          <nav className="flex-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-3 px-4 mb-1 rounded transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-gray-300'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <Link href="/" className="block py-2 px-4 text-sm text-gray-400 hover:text-white transition-colors">
              ← На сайт
            </Link>
            <button
              onClick={handleLogout}
              className="mt-2 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Выйти
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
