/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0B0F14',
          900: '#0F151C',
          800: '#151D26',
          700: '#1D2733',
          600: '#2A3542',
          500: '#3D4B5A',
          400: '#66768A',
          300: '#94A3B5',
          200: '#C4CDD8',
          100: '#E7ECF1'
        },
        mecha: {
          DEFAULT: '#FF6A1A',
          light: '#FF8A4D',
          dark: '#D9540F'
        },
        tech: {
          DEFAULT: '#2AC3FF',
          light: '#6BDBFF',
          dark: '#0E96CC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Rajdhani"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(255,106,26,0.45)',
        'glow-tech': '0 0 24px -6px rgba(42,195,255,0.45)',
        card: '0 4px 20px -4px rgba(0,0,0,0.5)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      }
    }
  },
  plugins: []
}
