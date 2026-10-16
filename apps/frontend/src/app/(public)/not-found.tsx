import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-text-primary">Страница не найдена</h2>
        <p className="mt-2 text-text-muted">
          Запрашиваемая страница не существует или была удалена.
        </p>
        <Link href="/">
          <Button className="mt-6">На главную</Button>
        </Link>
      </div>
    </div>
  );
}
