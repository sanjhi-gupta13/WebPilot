/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141E33',
          700: '#1E2D4A',
          600: '#2A3F66',
        },
        brand: {
          blue: '#2563EB',
          lightBlue: '#3B82F6',
          accent: '#60A5FA',
          glow: 'rgba(59, 130, 246, 0.25)',
        },
        proof: {
          verified: '#10B981',
          recovered: '#F59E0B',
          failed: '#EF4444',
          review: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(59, 130, 246, 0.2)',
        'glow-md': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
