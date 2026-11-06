const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const APP_NAME = 'Медиком Плюс';

export const CONTACT_INFO = {
  address: 'Краснодар, ул. им. Мачуги В.Н., 171/1',
  phones: ['+7 (918) 211-43-01', '+7 (861) 234-16-99'],
  email: 'medikom_plus@mail.ru',
  workHours: 'Пн–Пт 09:00–18:00',
  lat: 45.0355,
  lng: 38.9753,
  messengers: [
    {
      name: 'MAX',
      phone: '+7 (918) 417-17-77',
      href: 'https://max.ru/c/-72704411339278/AaGs12HJe_k',
    },
  ],
} as const;
