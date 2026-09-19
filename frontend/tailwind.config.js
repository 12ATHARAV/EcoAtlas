/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0b0f19', // Clean modern dark slate canvas
          900: '#0f172a', // Slate 900 primary dark
          850: '#151e2e', // Card surface with rich depth
          800: '#1e293b', // Raised card surface (Slate 800)
          700: '#334155', // Crisp clean borders (Slate 700)
          600: '#475569', // Muted borders & hover states
        },
        emerald: {
          400: '#34d399',
          500: '#10b981', // Clean Crisp Emerald
          600: '#059669',
        },
        gold: {
          300: '#fde047',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
