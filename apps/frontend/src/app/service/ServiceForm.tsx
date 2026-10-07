'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FormTextarea, FormSelect } from '@/components/ui/FormField';
import { FormPhoneInput, isPhoneValid, getPhoneForApi } from '@/components/ui/FormPhoneInput';
import { apiClient } from '@/lib/api/client';
import { CheckCircle, Paperclip, X } from 'lucide-react';
import { isEmpty } from '@/lib/validators';

interface ServiceFormData {
  name: string;
  phone: string;
  email: string;
  organization: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  problemDescription: string;
  photo?: File | null;
}

const ALLOWED_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export function ServiceForm() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    equipmentType: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    problemDescription: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // All fields are now required
    if (isEmpty(formData.name)) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (isEmpty(formData.phone)) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!isPhoneValid(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (isEmpty(formData.email)) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный адрес электронной почты';
    }

    if (isEmpty(formData.organization)) {
      newErrors.organization = 'Организация обязательна для заполнения';
    }

    if (isEmpty(formData.equipmentType)) {
      newErrors.equipmentType = 'Тип оборудования обязателен для заполнения';
    }

    if (isEmpty(formData.manufacturer)) {
      newErrors.manufacturer = 'Производитель обязателен для заполнения';
    }

    if (isEmpty(formData.model)) {
      newErrors.model = 'Модель обязательна для заполнения';
    }

    if (isEmpty(formData.problemDescription)) {
      newErrors.problemDescription = 'Описание проблемы обязательно';
    }

    // Photo validation (optional but check if uploaded)
    if (formData.photo) {
      if (!ALLOWED_PHOTO_TYPES.includes(formData.photo.type)) {
        newErrors.photo = 'Разрешены только изображения PNG, JPG, JPEG';
      }
      if (formData.photo.size > MAX_PHOTO_SIZE) {
        newErrors.photo = 'Размер файла не должен превышать 5 МБ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: 'Разрешены только изображения PNG, JPG, JPEG' }));
      return;
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
      setErrors((prev) => ({ ...prev, photo: 'Размер файла не должен превышать 5 МБ' }));
      return;
    }

    setFormData((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
    if (errors.photo) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state
    setFormState('idle');
    setErrors({});

    // Validate
    if (!validate()) {
      return;
    }

    setFormState('loading');

    try {
      // Prepare data for API
      const apiData = {
        name: formData.name,
        phone: getPhoneForApi(formData.phone),
        email: formData.email,
        organization: formData.organization,
        equipmentType: formData.equipmentType,
        manufacturer: formData.manufacturer,
        model: formData.model,
        serialNumber: formData.serialNumber,
        problemDescription: formData.problemDescription,
        // Note: file upload would need multipart/form-data support
        // For now, we pass photo name if exists
        file: formData.photo ? formData.photo.name : undefined,
      };

      await apiClient.submitServiceRequest(apiData);
      setFormState('success');
      setFormData({
        name: '', phone: '', email: '', organization: '',
        equipmentType: '', manufacturer: '', model: '', serialNumber: '',
        problemDescription: '', photo: null,
      });
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setFormState('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки';
      
      // Translate backend errors
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: 'Некорректный адрес электронной почты' });
      } else if (errorMessage.toLowerCase().includes('phone')) {
        setErrors({ phone: 'Некорректный номер телефона' });
      } else {
        setFormState('error');
      }
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background-alt p-8">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">
        Заявка на сервисное обслуживание
      </h2>

      {formState === 'success' ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-text-primary">Заявка отправлена!</h3>
          <p className="text-text-muted">Наш специалист свяжется с вами в ближайшее время.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Имя"
              required
              id="service-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ваше имя"
              error={errors.name}
              aria-invalid={!!errors.name}
            />
            <FormField
              label="Организация"
              required
              id="service-organization"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="Название организации"
              error={errors.organization}
              aria-invalid={!!errors.organization}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormPhoneInput
              label="Телефон"
              required
              id="service-phone"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              error={errors.phone}
            />
            <FormField
              label="Email"
              required
              type="email"
              id="service-email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              error={errors.email}
              aria-invalid={!!errors.email}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Тип оборудования"
              required
              id="service-equipment-type"
              value={formData.equipmentType}
              onChange={(e) => handleChange('equipmentType', e.target.value)}
              options={[
                { value: '', label: 'Выберите тип' },
                { value: 'dental-unit', label: 'Стоматологическая установка' },
                { value: 'sterilizer', label: 'Стерилизационное оборудование' },
                { value: 'xray', label: 'Рентгеновский аппарат' },
                { value: 'compressor', label: 'Компрессор' },
                { value: 'laboratory', label: 'Лабораторное оборудование' },
                { value: 'other', label: 'Другое' },
              ]}
              error={errors.equipmentType}
            />
            <FormField
              label="Производитель"
              required
              id="service-manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="Например: Mercury"
              error={errors.manufacturer}
              aria-invalid={!!errors.manufacturer}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Модель"
              required
              id="service-model"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="Модель оборудования"
              error={errors.model}
              aria-invalid={!!errors.model}
            />
            <FormField
              label="Серийный номер"
              id="service-serial-number"
              value={formData.serialNumber}
              onChange={(e) => handleChange('serialNumber', e.target.value)}
              placeholder="Серийный номер оборудования"
            />
          </div>

          <FormTextarea
            label="Описание проблемы"
            required
            id="service-problem-description"
            value={formData.problemDescription}
            onChange={(e) => handleChange('problemDescription', e.target.value)}
            placeholder="Опишите проблему или неисправность"
            rows={4}
            error={errors.problemDescription}
            aria-invalid={!!errors.problemDescription}
          />

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Фото оборудования <span className="text-text-muted font-normal">(необязательно)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              Прикрепить фото
            </button>
            {photoPreview && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-text-primary">{formData.photo?.name}</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-text-muted hover:text-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.photo && (
              <p className="mt-1 text-xs text-error">{errors.photo}</p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              Форматы: PNG, JPG, JPEG. Макс. размер: 5 МБ
            </p>
          </div>

          {formState === 'error' && (
            <div className="text-sm text-error" role="alert">
              Ошибка отправки. Попробуйте ещё раз.
            </div>
          )}

          <Button type="submit" disabled={formState === 'loading'}>
            {formState === 'loading' ? 'Отправка...' : 'Отправить заявку'}
          </Button>
        </form>
      )}
    </div>
  );
}
