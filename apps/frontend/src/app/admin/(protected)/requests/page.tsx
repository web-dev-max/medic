import { cookies } from 'next/headers';
import RequestsList from './RequestsList';

async function getRequests() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/dashboard/recent-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}

export default async function RequestsPage() {
  const requests = await getRequests();

  return <RequestsList requests={requests} />;
}
