'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FormTextarea } from '@/components/ui/FormField';
import { FormPhoneInput, isPhoneValid, getPhoneForApi } from '@/components/ui/FormPhoneInput';
import { apiClient } from '@/lib/api/client';
import { CheckCircle } from 'lucide-react';
import { requiredField, emailValidator, isEmpty } from '@/lib/validators';
import { ConsentCheckbox } from '@/components/ui/ConsentCheckbox';

export function ContactForm() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Name validation (required)
    const nameError = requiredField().validate(formData.name);
    if (nameError) newErrors.name = nameError;

    // Phone validation (required)
    if (isEmpty(formData.phone)) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!isPhoneValid(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    // Email validation (required - per backend DTO)
    if (isEmpty(formData.email)) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (emailValidator().validate(formData.email)) {
      newErrors.email = 'Введите корректный адрес электронной почты';
    }

    // Message validation (required)
    const messageError = requiredField().validate(formData.message);
    if (messageError) newErrors.message = messageError;

    // Consent validation (required)
    if (!consentGiven) {
      newErrors.consent = 'Необходимо дать согласие на обработку персональных данных';
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
      // Parse phone to API format
      const apiData = { ...formData, phone: getPhoneForApi(formData.phone) };
      await apiClient.submitGeneralRequest(apiData);
      setFormState('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setFormState('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки';
      
      // Check if backend returned specific field errors
      if (errorMessage.includes('email') || errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: 'Некорректный адрес электронной почты' });
      } else {
        setFormState('error');
      }
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-border bg-background-alt p-8">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">Обратная связь</h2>

      {formState === 'success' ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-text-primary">Сообщение отправлено!</h3>
          <p className="text-text-muted">Мы свяжемся с вами в ближайшее время.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Имя"
              required
              id="contact-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ваше имя"
              error={errors.name}
              aria-invalid={!!errors.name}
            />
            <FormPhoneInput
              label="Телефон"
              required
              id="contact-phone"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              error={errors.phone}
            />
          </div>

          <FormField
            label="Email"
            required
            type="email"
            id="contact-email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            error={errors.email}
            aria-invalid={!!errors.email}
          />

          <FormTextarea
            label="Сообщение"
            required
            id="contact-message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Ваше сообщение"
            rows={4}
            error={errors.message}
            aria-invalid={!!errors.message}
          />

          {formState === 'error' && (
            <div className="text-sm text-error" role="alert">
              Ошибка отправки. Попробуйте ещё раз.
            </div>
          )}

          <Button type="submit" disabled={formState === 'loading'}>
            {formState === 'loading' ? 'Отправка...' : 'Отправить'}
          </Button>

          <ConsentCheckbox
            checked={consentGiven}
            onChange={(checked) => {
              setConsentGiven(checked);
              if (errors.consent) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.consent;
                  return newErrors;
                });
              }
            }}
            error={errors.consent}
          />
        </form>
      )}
    </div>
  );
}
