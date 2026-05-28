/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-in-up': 'slideInUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'bounce-once': 'bounceOnce 0.5s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'emerald': '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
        'emerald-lg': '0 10px 40px 0 rgba(16, 185, 129, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #064e3b 0%, #030712 50%, #0c0c1a 100%)',
      },
    },
  },
  plugins: [],
  safelist: [
    // Dynamic color classes used in components
    { pattern: /bg-(emerald|blue|purple|yellow|pink|red|green|cyan|orange|gray)-(400|500|600|700|800|900)\/(10|20|30|40|50)/ },
    { pattern: /text-(emerald|blue|purple|yellow|pink|red|green|cyan|orange|gray)-(300|400|500)/ },
    { pattern: /border-(emerald|blue|purple|yellow|pink|red|green|cyan|orange|gray)-(400|500|600|700)\/(20|30|40|50)/ },
  ],
};
