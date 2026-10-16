import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Medikom Plus — Панель управления',
    template: '%s — Админ-панель',
  },
  description: 'Панель управления для Medikom Plus',
};

// Root layout for admin routes - wraps in DashboardShell
import DashboardShell from './DashboardShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
