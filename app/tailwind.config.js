/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Фирменная палитра Futurebox
        primary: {
          DEFAULT: '#2a9648',
          dark: '#248a3f',
          light: '#34a854',
        },
        accent: {
          green: '#2a9648',
          'green-light': '#c1f9d0',
          red: '#fc574d',
        },
        neutral: {
          space: '#1D1D1D',
          black: '#151515',
          dark: '#444444',
          'dark-gray': '#727272',
          gray: '#a7a7a7',
          medium: '#666666',
          light: '#f2f2f2',
          lighter: '#999999',
        },
        surface: {
          glass: 'rgba(255, 255, 255, 0.6)',
          'glass-dark': 'rgba(255, 255, 255, 0.1)',
          'glass-light': 'rgba(255, 255, 255, 0.5)',
          'glass-green': 'rgba(42, 150, 72, 0.5)',
          white: '#FFFFFF',
        },
        border: {
          light: '#e6e6e6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Типографическая система
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'heading-1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
      },
      spacing: {
        '18': '72px',
      },
      borderRadius: {
        'card': '12px',
        'button': '4px',
      },
      backdropBlur: {
        'glass': '30px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 8px rgba(42, 150, 72, 0.2)',
        'button-hover': '0 4px 12px rgba(42, 150, 72, 0.3)',
      },
    },
  },
  plugins: [],
}

