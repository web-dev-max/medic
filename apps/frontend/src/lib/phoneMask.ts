export const PHONE_MASK_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

export function formatPhoneValue(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';

  // Пользователь ввёл только код страны — оставляем открытую скобку
  if (digits === '7' || digits === '8') return '+7 (';

  let national = digits;

  if (national.startsWith('8')) {
    national = national.slice(1);
  } else if (national.startsWith('7') && national.length > 10) {
    national = national.slice(1);
  } else if (rawValue.trim().startsWith('+7') && national.startsWith('7')) {
    national = national.slice(1);
  }

  national = national.slice(0, 10);

  const p1 = national.slice(0, 3);
  const p2 = national.slice(3, 6);
  const p3 = national.slice(6, 8);
  const p4 = national.slice(8, 10);

  let result = '+7';
  if (p1) result += ` (${p1}`;

  // Ключевой момент: закрываем скобку только если
  // (а) после неё уже есть цифры, либо (б) она была во вводе.
  // Иначе backspace на ")" зацикливается.
  if (p1.length === 3 && (p2.length > 0 || rawValue.includes(')'))) {
    result += ')';
  }

  if (p2) result += ` ${p2}`;
  if (p3) result += `-${p3}`;
  if (p4) result += `-${p4}`;

  return result;
}

export function parsePhoneForApi(phoneWithMask: string): string {
  const digits = phoneWithMask.replace(/\D/g, '');
  if (!digits) return '';

  let national = digits;
  if (national.startsWith('8')) {
    national = national.slice(1);
  } else if (national.startsWith('7') && national.length > 10) {
    national = national.slice(1);
  }
  national = national.slice(0, 10);

  return national.length === 10 ? `+7${national}` : '';
}

export function validatePhone(phone: string): boolean {
  return PHONE_MASK_PATTERN.test(phone);
}