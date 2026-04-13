import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gift: {
          'near-black':   '#121212',
          bg:             '#121212',
          surface:        '#181818',
          'bg-2':         '#181818',
          'mid-dark':     '#1f1f1f',
          'bg-3':         '#1f1f1f',
          panel:          '#1f1f1f',
          silver:         '#b3b3b3',
          'grey-body':    '#b3b3b3',
          'grey-light':   '#ebebeb',
          green:          '#005633',
          'green-dark':   '#153f24',
          'green-mid':    '#49895d',
          'green-teal':   '#429574',
          'green-sage':   '#809888',
          'green-pale-1': '#e4eee9',
          'green-pale-2': '#eef4f0',
          'green-pale-3': '#ecf5ed',
          negative:       '#f3727f',
          warning:        '#ffa42b',
          announcement:   '#539df5',
        },
      },
      fontFamily: {
        sans:    ['var(--font-noto-jp)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
        mincho:  ['var(--font-mincho)'],
      },
      fontSize: {
        small:  ['13px', { lineHeight: '1.5' }],
        normal: ['16px', { lineHeight: '1.75' }],
        medium: ['20px', { lineHeight: '1.5' }],
        large:  ['36px', { lineHeight: '1.25' }],
        xlarge: ['42px', { lineHeight: '1.15' }],
      },
      borderRadius: {
        pill: '9999px',
        cta:  '8px',
      },
      boxShadow: {
        natural:       '6px 6px 9px rgba(0,0,0,0.2)',
        deep:          '12px 12px 50px rgba(0,0,0,0.4)',
        sharp:         '6px 6px 0px rgba(0,0,0,0.2)',
        outlined:      '6px 6px 0px -3px #fff, 6px 6px #000',
        crisp:         '6px 6px 0px #000',
        'accent-hover':'0 4px 12px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.16)',
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
    },
  },
  plugins: [],
} satisfies Config;
