export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const APP_NAME = 'Медиком Плюс';

export const CONTACT_INFO = {
  address: 'Краснодар, ул. им. Мачуги В.Н., 171/1',
  phones: ['+7 (918) 417-17-77', '+7 (918) 211-43-01'],
  email: 'medikom_plus@mail.ru',
  workHours: 'Пн–Пт 09:00–18:00',
  lat: 45.0355,
  lng: 38.9753,
} as const;

export const CATEGORIES = [
  {
    id: 1,
    name: 'Стоматологические установки',
    slug: 'dental-units',
    image: '/images/categories/dental-unit.svg',
  },
  {
    id: 2,
    name: 'Стерилизационное оборудование',
    slug: 'sterilization',
    image: '/images/categories/sterilization.svg',
  },
  {
    id: 3,
    name: 'Рентгенодиагностика',
    slug: 'x-ray-diagnostic',
    image: '/images/categories/xray.svg',
  },
  {
    id: 4,
    name: 'Компрессоры и аспирация',
    slug: 'compressors',
    image: '/images/categories/compressor.svg',
  },
  {
    id: 5,
    name: 'Мебель',
    slug: 'furniture',
    image: '/images/categories/furniture.svg',
  },
  {
    id: 6,
    name: 'Инструменты и наконечники',
    slug: 'instruments',
    image: '/images/categories/instruments.svg',
  },
  {
    id: 7,
    name: 'Лабораторное оборудование',
    slug: 'laboratory',
    image: '/images/categories/laboratory.svg',
  },
  {
    id: 8,
    name: 'Расходные материалы',
    slug: 'consumables',
    image: '/images/categories/consumables.svg',
  },
  {
    id: 9,
    name: 'Имплантология',
    slug: 'implantology',
    image: '/images/categories/implantology.svg',
  },
  {
    id: 10,
    name: 'Стоматологические лазеры и свет',
    slug: 'lasers',
    image: '/images/categories/lasers.svg',
  },
] as const;
