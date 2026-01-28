/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Extended screens with xs breakpoint for very small devices
      screens: {
        'xs': '480px',
      },
      // Touch-friendly spacing (minimum 44px touch targets)
      spacing: {
        '11': '2.75rem',  // 44px - minimum touch target
        '12': '3rem',     // 48px - preferred touch target  
        '13': '3.25rem',
        '14': '3.5rem',   // 56px - large touch target
        '15': '3.75rem',
        '16': '4rem',     // 64px - extra large touch target
        '18': '4.5rem',
      },
      // Minimum touch target sizes
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      // Font sizes for fluid typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}; 