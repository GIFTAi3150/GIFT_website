import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gift: {
          // Green-family B2B palette — logo-aligned, light/bright
          'near-black': '#D7DDD9',
          bg: '#D7DDD9',
          'bg-alt': '#CFD5D1',
          'bg-bright': '#E0E5E1',
          surface: '#FFFFFF',
          'bg-2': '#CFD5D1',
          'mid-dark': '#FFFFFF',
          'bg-3': '#CFD5D1',
          panel: '#FFFFFF',
          ink: '#111827',
          silver: '#4B5563',
          'grey-body': '#4B5563',
          'grey-light': '#94A3B8',
          green: '#047857',
          'green-dark': '#064E3B',
          'green-mid': '#10B981',
          'green-teal': '#0D9488',
          'green-sage': '#8A9A85',
          'green-pale-1': '#E4EEE9',
          'green-pale-2': '#EEF4F0',
          'green-pale-3': '#ECF5ED',
          accent: '#0D9488', // soft teal — small secondary details
          hover: '#2563EB', // cobalt blue — hover pop
          'hover-dark': '#1D4ED8', // active/pressed cobalt
          border: '#E2E8E2',
          negative: '#E05362',
          warning: '#D98B1F',
          announcement: '#3A82D1',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-jp)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
        mincho: ['var(--font-mincho)'],
      },
      fontSize: {
        small: ['13px', { lineHeight: '1.5' }],
        normal: ['16px', { lineHeight: '1.75' }],
        medium: ['20px', { lineHeight: '1.5' }],
        large: ['36px', { lineHeight: '1.25' }],
        xlarge: ['42px', { lineHeight: '1.15' }],
      },
      borderRadius: {
        pill: '9999px',
        cta: '8px',
      },
      boxShadow: {
        natural: '6px 6px 9px rgba(0,0,0,0.2)',
        deep: '12px 12px 50px rgba(0,0,0,0.4)',
        sharp: '6px 6px 0px rgba(0,0,0,0.2)',
        outlined: '6px 6px 0px -3px #fff, 6px 6px #000',
        crisp: '6px 6px 0px #000',
        'accent-hover': '0 4px 12px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.16)',
      },
      spacing: {
        's-20': '0.44rem',
        's-30': '0.67rem',
        's-40': '1rem',
        's-50': '1.5rem',
        's-60': '2.25rem',
        's-70': '3.38rem',
        's-80': '5.06rem',
      },
      maxWidth: {
        container: '72rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
