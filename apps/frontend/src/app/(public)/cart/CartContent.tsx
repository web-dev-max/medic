'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FormTextarea } from '@/components/ui/FormField';
import { FormPhoneInput, isPhoneValid, getPhoneForApi } from '@/components/ui/FormPhoneInput';
import { apiClient } from '@/lib/api/client';
import { Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ImageWithPlaceholder } from '@/components/ui/ImageWithPlaceholder';
import { useCartStore } from '@/stores/cartStore';
import { isEmpty } from '@/lib/validators';
import { ConsentCheckbox } from '@/components/ui/ConsentCheckbox';

export function CartContent() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(p);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Name validation (required)
    if (isEmpty(formData.name)) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    // Phone validation (required)
    if (isEmpty(formData.phone)) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!isPhoneValid(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    // Email validation (required - per backend DTO)
    if (isEmpty(formData.email)) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный адрес электронной почты';
    }

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
      const apiData = { ...formData, phone: getPhoneForApi(formData.phone) };
      await apiClient.submitCartRequest({
        ...apiData,
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
      setFormState('success');
      // Clear cart after showing success modal for 5 seconds
      setTimeout(() => {
        clearCart();
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки';
      
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: 'Некорректный адрес электронной почты' });
      } else {
        setFormState('error');
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-background-alt" />
        <h1 className="text-2xl font-bold text-text-primary">Корзина пуста</h1>
        <p className="text-text-muted max-w-md">
          Добавьте товары из каталога, чтобы оформить заявку
        </p>
        <Link href="/catalog">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-border bg-white p-4"
              >
                <Link
                  href={`/product/${encodeURIComponent(item.slug)}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-background-alt"
                >
                  <ImageWithPlaceholder
                    src={item.image || null}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${encodeURIComponent(item.slug)}`}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    {item.name}
                  </Link>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-white p-6 sticky top-24">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              Контактные данные
            </h2>

            {formState === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle className="h-16 w-16 text-success" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Заявка отправлена!
                </h3>
                <p className="text-sm text-text-muted">
                  Мы свяжемся с вами в ближайшее время.
                </p>
                <Link href="/catalog">
                  <Button>Продолжить покупки</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="rounded-lg bg-background-alt p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-text-muted">Товаров:</span>
                    <span className="font-medium text-text-primary">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Итого:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <FormField
                  label="Имя"
                  required
                  id="cart-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ваше имя"
                  error={errors.name}
                  aria-invalid={!!errors.name}
                />

                <FormPhoneInput
                  label="Телефон"
                  required
                  id="cart-phone"
                  value={formData.phone}
                  onChange={(value) => handleChange('phone', value)}
                  error={errors.phone}
                />

                <FormField
                  label="Email"
                  required
                  type="email"
                  id="cart-email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  error={errors.email}
                  aria-invalid={!!errors.email}
                />

                <FormTextarea
                  label="Комментарий"
                  id="cart-comment"
                  value={formData.comment}
                  onChange={(e) => handleChange('comment', e.target.value)}
                  placeholder="Дополнительная информация"
                  rows={3}
                />

                {formState === 'error' && (
                  <div className="text-sm text-error" role="alert">
                    Ошибка отправки. Попробуйте ещё раз.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={formState === 'loading'}
                >
                  {formState === 'loading' ? 'Отправка...' : 'Отправить заявку'}
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
        </div>
      </div>
    </>
  );
}
