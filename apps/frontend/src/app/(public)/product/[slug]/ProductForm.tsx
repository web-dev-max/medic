'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FormTextarea } from '@/components/ui/FormField';
import { FormPhoneInput, isPhoneValid, getPhoneForApi } from '@/components/ui/FormPhoneInput';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api/client';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { isEmpty } from '@/lib/validators';
import { ConsentCheckbox } from '@/components/ui/ConsentCheckbox';

interface ProductFormProps {
  productId: number;
  productName: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image?: string;
}

export function ProductForm({ productId, productName, slug, price, oldPrice, image }: ProductFormProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
  });

  // Get cart state from Zustand
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const cartItem = items.find((item) => item.id === productId);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  const formatPrice = (p: number) => {
    if (p <= 0) {
      return 'Уточните цену, обратившись по заявке';
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  const handleAddToCart = () => {
    if (price <= 0) {
      return; // Prevent adding zero-price items
    }

    addItem({
      id: productId,
      name: productName,
      slug: slug,
      price,
      image: image || '',
    });
  };

  const handleIncrease = () => {
    if (price <= 0) return;
    useCartStore.getState().updateQuantity(productId, cartQuantity + 1);
  };

  const handleDecrease = () => {
    if (price <= 0) return;
    if (cartQuantity <= 1) {
      useCartStore.getState().removeItem(productId);
    } else {
      useCartStore.getState().updateQuantity(productId, cartQuantity - 1);
    }
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
      await apiClient.submitPriceInquiryRequest({
        ...apiData,
        productId: String(productId),
        productName,
      });
      setFormState('success');
      setTimeout(() => {
        setShowOrderModal(false);
        setFormState('idle');
        setFormData({ name: '', phone: '', email: '', comment: '' });
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

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setFormState('idle');
    setErrors({});
    setFormData({ name: '', phone: '', email: '', comment: '' });
  };

  return (
    <>
      <div className="rounded-xl bg-background-alt p-6">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-text-primary">
            {formatPrice(price)}
          </span>
          {oldPrice && oldPrice > price && price > 0 && (
            <span className="text-lg text-text-muted line-through">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {price <= 0 ? (
            /* Zero price - show "Request Price" button */
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowOrderModal(true)}
            >
              Уточнить цену
            </Button>
          ) : isInCart ? (
            /* In cart - show quantity controls */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleDecrease}
                  title="Уменьшить количество"
                >
                  −
                </Button>
                <span className="w-12 text-center text-lg font-bold text-text-primary">
                  {cartQuantity}
                </span>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleIncrease}
                  title="Увеличить количество"
                >
                  +
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setShowOrderModal(true)}
              >
                Получить консультацию
              </Button>
            </div>
          ) : (
            /* Not in cart - show add to cart button */
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                В заявку
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setShowOrderModal(true)}
              >
                Получить консультацию
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showOrderModal}
        onClose={handleCloseModal}
        title="Заказать товар"
        size="md"
      >
        {formState === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-16 w-16 text-success" />
            <h3 className="text-xl font-semibold text-text-primary">Заявка отправлена!</h3>
            <p className="text-text-muted">
              Мы свяжемся с вами в ближайшее время для уточнения деталей.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="mb-4 text-sm text-text-muted">
              Товар: <span className="font-medium text-text-primary">{productName}</span>
            </p>

            <FormField
              label="Имя"
              required
              id="product-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ваше имя"
              error={errors.name}
              aria-invalid={!!errors.name}
            />

            <FormPhoneInput
              label="Телефон"
              required
              id="product-phone"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              error={errors.phone}
            />

            <FormField
              label="Email"
              required
              type="email"
              id="product-email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              error={errors.email}
              aria-invalid={!!errors.email}
            />

            <FormTextarea
              label="Комментарий"
              id="product-comment"
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

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={formState === 'loading'}
              >
                {formState === 'loading' ? 'Отправка...' : 'Отправить заявку'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Отмена
              </Button>
            </div>

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
      </Modal>
    </>
  );
}
