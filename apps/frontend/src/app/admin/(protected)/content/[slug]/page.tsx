'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContentEditPage({ params }: { params: { slug: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    fetchContent();
  }, [params.slug]);

  const fetchContent = async () => {
    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/content/${params.slug}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setFormData({
        title: data.title || '',
        content: data.content || '',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
      });
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Не удалось загрузить контент');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/content/${params.slug}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.errors || 'Failed to save content');
      }

      const _savedData = await response.json();
      
      // Verify save by re-fetching
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/content/${params.slug}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (verifyResponse.ok) {
        const verifiedData = await verifyResponse.json();
        
        // Verify critical fields match
        if (verifiedData.content === formData.content && verifiedData.title === formData.title) {
          setSuccess('Контент успешно сохранён и проверен');
        } else {
          setSuccess('Контент сохранён (рекомендуется обновить страницу)');
        }
      } else {
        setSuccess('Контент сохранён');
      }
      
      // Refresh the form with latest data
      const freshData = await verifyResponse.json();
      setFormData({
        title: freshData.title || '',
        content: freshData.content || '',
        seoTitle: freshData.seoTitle || '',
        seoDescription: freshData.seoDescription || '',
      });
      
      setTimeout(() => setSuccess(''), 5000);
      setTimeout(() => window.location.href = '/admin/content', 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось сохранить контент';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const _router = useRouter();

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать страницу</h1>
          <p className="text-gray-600 mt-2">{params.slug}</p>
        </div>
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          ← На главную
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок страницы *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Содержимое (HTML) *
          </label>
          <textarea
            name="content"
            required
            rows={20}
            value={formData.content}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            placeholder="<div className='section'>...</div>"
          />
          <p className="mt-1 text-xs text-gray-500">
            Вставьте HTML-код страницы гарантии
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO заголовок
          </label>
          <input
            type="text"
            name="seoTitle"
            value={formData.seoTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO описание
          </label>
          <textarea
            name="seoDescription"
            rows={3}
            value={formData.seoDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Link
            href="/admin"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
