import { cookies } from 'next/headers';
import DashboardContent from './DashboardContent';

async function getStatistics() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/dashboard/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const statistics = await getStatistics();

  return <DashboardContent statistics={statistics} />;
}
