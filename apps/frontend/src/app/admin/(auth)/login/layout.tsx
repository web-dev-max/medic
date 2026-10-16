import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  // Если уже залогинен — редирект на дашборд
  if (token) {
    redirect('/admin');
  }

  return <>{children}</>;
}
