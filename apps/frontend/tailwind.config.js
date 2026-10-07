const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007B8D',
          dark: '#005F6B',
          light: '#E8F4F8',
        },
        background: {
          DEFAULT: '#FFFFFF',
          alt: '#F5F7FA',
        },
        text: {
          primary: '#1A2A3A',
          secondary: '#4A5568',
          muted: '#718096',
        },
        border: '#E2E8F0',
        footer: {
          bg: '#0A3D4A',
          text: '#B0C4D0',
        },
        warranty: {
          bg: '#0A5A6B',
        },
        success: '#38A169',
        error: '#E53E3E',
        warning: '#DD6B20',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['36px', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '24px',
          md: '24px',
          lg: '24px',
        },
        screens: {
          xl: '1280px',
        },
      },
    },
  },
  plugins: [],
};
