const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');
const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './app/**/*.{ts,tsx,jsx,js}',
    './libs/{ui-components,util}/**/*.{ts,tsx,jsx,js}',
    // '@ui-components/common/**/*.{ts,tsx,jsx,js}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        sans: ['var(--font-body)'],
        ballet: ['Ballet'],
        italiana: ['Italiana'],
        sen: ['Sen'],
        aboreto: ['Aboreto'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary-DEFAULT) / <alpha-value>)',
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent-DEFAULT) / <alpha-value>)',
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
          200: 'rgb(var(--color-accent-200) / <alpha-value>)',
          300: 'rgb(var(--color-accent-300) / <alpha-value>)',
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700) / <alpha-value>)',
          800: 'rgb(var(--color-accent-800) / <alpha-value>)',
          900: 'rgb(var(--color-accent-900) / <alpha-value>)',
        },
        highlight: {
          DEFAULT: 'rgb(var(--color-highlight-DEFAULT) / <alpha-value>)',
          50: 'rgb(var(--color-highlight-50) / <alpha-value>)',
          100: 'rgb(var(--color-highlight-100) / <alpha-value>)',
          200: 'rgb(var(--color-highlight-200) / <alpha-value>)',
          300: 'rgb(var(--color-highlight-300) / <alpha-value>)',
          400: 'rgb(var(--color-highlight-400) / <alpha-value>)',
          500: 'rgb(var(--color-highlight-500) / <alpha-value>)',
          600: 'rgb(var(--color-highlight-600) / <alpha-value>)',
          700: 'rgb(var(--color-highlight-700) / <alpha-value>)',
          800: 'rgb(var(--color-highlight-800) / <alpha-value>)',
          900: 'rgb(var(--color-highlight-900) / <alpha-value>)',
        },
      },
      screens: {
        xs: '400px',
      },
      fontSize: {
        '2xs': '.65rem',
        '2xl': ['1.5rem', { lineHeight: '1.5rem' }],
      },
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
        11: '11',
        12: '12',
        13: '13',
        14: '14',
        15: '15',
        16: '16',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
};
