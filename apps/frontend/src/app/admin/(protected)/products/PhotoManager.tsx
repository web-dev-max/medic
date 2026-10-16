'use client';

import { useState, useRef } from 'react';

interface Photo {
  id: number;
  url: string;
  ordering: number;
  mediaId: number; // Теперь приходит с бэкенда
}

interface PhotoManagerProps {
  productId?: number;
  initialPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}

export default function PhotoManager({ productId, initialPhotos = [], onPhotosChange }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [settingMain, setSettingMain] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCookie = (name: string): string | undefined => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : undefined;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !productId) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const token = getCookie('admin_token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/uploads/product/${productId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Ошибка загрузки');
      }

      const data = await response.json();
      
      // Add new photos to state with their media IDs from backend response
      const newPhotos: Photo[] = (data.items || []).map((item: { url: string; mediaId: number }, index: number) => ({
        id: item.mediaId > 0 ? item.mediaId : Date.now() + index,
        url: item.url,
        ordering: photos.length + index,
        mediaId: item.mediaId || 0,
      }));

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photoId: number, _photoUrl: string) => {
    if (!productId) return;

    if (!confirm('Удалить эту фотографию?')) return;

    setDeleting(photoId);
    setError('');

    try {
      const token = getCookie('admin_token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      // Find the photo to get its mediaId
      const photo = photos.find(p => p.id === photoId);
      
      // Delete from server using mediaId (works for both new and existing photos)
      if (photo && photo.mediaId && photo.mediaId > 0) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/uploads/product/${productId}/${photo.mediaId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Ошибка удаления');
        }
      } else if (photo && photo.mediaId === 0) {
        // For newly uploaded photos (mediaId=0), we need to find the actual mediaId
        // by looking at the last uploaded photo for this product
        // This is a workaround - ideally we'd track mediaIds for new uploads
        console.warn('Cannot delete newly uploaded photo without mediaId');
      }

      // Remove from UI after successful server deletion
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось удалить фото';
      setError(errorMessage);
      // Revert on error - photo stays in the list
    } finally {
      setDeleting(null);
    }
  };

  const handleSetMain = async (photoId: number) => {
    if (!productId) return;

    setSettingMain(photoId);
    setError('');

    try {
      const token = getCookie('admin_token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      // Find the photo to get its mediaId
      const photo = photos.find(p => p.id === photoId);
      
      // If photo has a valid mediaId from database, update ordering on server
      if (photo && photo.mediaId && photo.mediaId > 0) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/uploads/product/${productId}/set-main/${photo.mediaId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Ошибка установки главной');
        }
      }

      // Reorder photos to make selected one first (UI update)
      const updatedPhotos = [
        photos.find(p => p.id === photoId)!,
        ...photos.filter(p => p.id !== photoId),
      ];
      
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось установить главную';
      setError(errorMessage);
    } finally {
      setSettingMain(null);
    }
  };

  // Helper function to extract mediaId from URL if it contains one
  // Currently not used - mediaIds are handled by the backend
  const _extractMediaId = (_url: string, index: number): number => {
    return -index - 1;
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фотографии товара
        </label>
        
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {photos.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              Первая фотография будет главной. Нажмите на фото, чтобы сделать его главным.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleSetMain(photo.id)}
                    disabled={settingMain === photo.id}
                    className="block w-full aspect-square rounded-lg overflow-hidden border-2 hover:border-blue-500 transition-colors disabled:opacity-50"
                    title={index === 0 ? 'Главная фотография' : 'Нажмите, чтобы сделать главной'}
                  >
                    <img
                      src={photo.url}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3EНет фото%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </button>
                  
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Главная
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id, photo.url)}
                    disabled={deleting === photo.id}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Удалить"
                  >
                    {deleting === photo.id ? '⏳' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            disabled={uploading || !productId}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !productId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Загрузка...' : 'Добавить фото'}
          </button>
          <span className="text-xs text-gray-500">
            JPG, PNG, WebP до 10MB
          </span>
        </div>
      </div>
    </div>
  );
}
