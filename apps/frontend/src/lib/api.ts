/**
 * Utility functions for making authenticated API requests
 */

export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
};

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getCookie('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, redirect to login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  return response;
};

export const deleteFetch = async (url: string): Promise<Response> => {
  return apiFetch(url, { method: 'DELETE' });
};

export const postFetch = async (
  url: string,
  body: unknown
): Promise<Response> => {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const putFetch = async (
  url: string,
  body: unknown
): Promise<Response> => {
  return apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};
