# Medikom Plus — Медицинское и стоматологическое оборудование

Современный адаптивный сайт компании «Медиком Плюс» с каталогом медицинского оборудования.

## 📁 Структура проекта

```
Medic/
├── apps/
│   ├── backend/              # NestJS REST API
│   │   ├── src/
│   │   │   ├── modules/      # Модули (products, categories, brands, requests, etc.)
│   │   │   ├── common/       # Общие компоненты (guards, filters)
│   │   │   └── config/       # Конфигурации
│   │   └── package.json
│   │
│   └── frontend/             # Next.js 14+ (App Router)
│       ├── src/
│       │   ├── app/          # Страницы (Next.js App Router)
│       │   ├── components/   # React-компоненты
│       │   │   ├── ui/       # Базовые UI-компоненты
│       │   │   ├── layout/   # Layout (Header, Footer, etc.)
│       │   │   ├── catalog/  # Компоненты каталога
│       │   │   └── home/     # Компоненты главной страницы
│       │   ├── lib/          # Утилиты и API-клиент
│       │   └── stores/       # State management
│       └── package.json
│
└── packages/
    └── shared/               # Общие типы и интерфейсы
```

## 🚀 Начало работы

### Требования

- Node.js >= 18.0.0
- pnpm (рекомендуется) или npm

### Установка

```bash
# Установка зависимостей
pnpm install

# Запуск frontend
pnpm dev:frontend

# Запуск backend
pnpm dev:backend

# Запуск обоих
pnpm dev
```

## 📄 Страницы

### Публичный сайт

- `/` — Главная страница
- `/catalog` — Каталог оборудования
- `/catalog/[slug]` — Страница категории
- `/product/[slug]` — Карточка товара
- `/cart` — Корзина-заявка
- `/search` — Поиск
- `/about` — О компании
- `/service` — Сервисное обслуживание
- `/warranty` — Гарантия
- `/delivery` — Доставка
- `/leasing` — Лизинг
- `/contacts` — Контакты

### Админ-панель (в разработке)

- `/admin/login` — Авторизация
- `/admin/dashboard` — Панель управления
- `/admin/products` — Управление товарами
- `/admin/categories` — Управление категориями
- `/admin/requests` — Заявки

## 🔌 API Endpoints

### Продукты

- `GET /api/products` — Список товаров с пагинацией
- `GET /api/products/:slug` — Карточка товара
- `POST /api/products` — Создать товар (admin)
- `PATCH /api/products/:id` — Обновить товар (admin)
- `DELETE /api/products/:id` — Удалить товар (admin)

### Категории

- `GET /api/categories` — Список категорий
- `GET /api/categories/tree` — Дерево категорий
- `GET /api/categories/:slug` — Категория по slug

### Бренды

- `GET /api/brands` — Список брендов

### Заявки

- `POST /api/requests/callback` — Обратный звонок
- `POST /api/requests/product` — Заказ товара
- `POST /api/requests/service` — Сервисная заявка
- `POST /api/requests/general` — Общая заявка
- `POST /api/requests/cart` — Корзина-заявка

### SEO

- `GET /robots.txt` — Файл robots.txt
- `GET /sitemap.xml` — Карта сайта

## 🎨 Дизайн-система

### Цвета

- Primary: `#0097A7` (teal)
- Primary Dark: `#006064`
- Background: `#FFFFFF`
- Background Alt: `#F5F7FA`
- Text Primary: `#1A2A3A`
- Text Secondary: `#4A5568`

### Типографика

- Шрифт: Inter
- H1: 48px / 700
- H2: 36px / 700
- H3: 24px / 600
- Body: 16px / 400

## 📱 Адаптивность

Сайт адаптирован для:

- Desktop (1280px+)
- Laptop (1024px - 1279px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔧 Технологии

### Frontend

- Next.js 14+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Zustand

### Backend

- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT Auth
- Nodemailer

## 📝 Разработка

### Добавление новой страницы

1. Создайте файл в `apps/frontend/src/app/[page-name]/page.tsx`
2. Добавьте metadata (title, description, canonical)
3. Используйте компоненты из `@/components/`
4. Добавьте Breadcrumbs

### Работа с API

```typescript
import { apiClient } from '@/lib/api/client';
import { useProducts } from '@/lib/api/hooks';

// В компоненте
const { data, isLoading } = useProducts({ page: 1, pageSize: 12 });
```

### Добавление UI-компонента

1. Создайте файл в `apps/frontend/src/components/ui/`
2. Используйте Tailwind CSS для стилизации
3. Используйте `cn()` для объединения классов
4. Добавьте props и TypeScript типы

## 🚀 Deployment

### Frontend (Vercel)

```bash
pnpm build:frontend
```

### Backend (Docker)

```bash
pnpm build:backend
docker build -t medikom-backend .
```

## 📄 Лицензия

© 2025 Медиком Плюс. Все права защищены.
