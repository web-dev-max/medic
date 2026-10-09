/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF даёт лучшее качество при меньшем весе, чем JPEG/WebP
    formats: ['image/avif', 'image/webp'],

    // Качества, которые можно запрашивать через <Image quality={...}>
    // (обязательно для Next 15+, иначе будет ошибка на любое значение кроме дефолтного 75)
    qualities: [75, 85, 90, 95, 100],

    // Размеры устройств для srcset — расширил до 2560 и 3840,
    // чтобы retina-экраны и широкие мониторы не получали апскейл
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // remotePatterns — разрешаем загрузку изображений с:
    // 1. локального backend (uploads)
    // 2. Unsplash (для editorial контента)
    // 3. production домена (если используется)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Production: uncomment when deploying
      // {
      //   protocol: 'https',
      //   hostname: 'medikomplus.ru',
      //   pathname: '/images/**',
      // },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
      },
      // Proxy uploads to backend
      {
        source: '/uploads/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/uploads/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/catalog.html',
        destination: '/catalog',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
