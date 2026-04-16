import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gift: {
          // WhatsApp-inspired palette — extracted from whatsapp.com production CSS 2026-04-16
          // Two greens (bright #25D366 + deep teal #128C7E). Monochrome neutrals.
          'near-black': '#F0F4F9',
          bg: '#F0F4F9',
          'bg-alt': '#F7F9FC',
          'bg-bright': '#FFFFFF',
          surface: '#FFFFFF',
          'bg-2': '#F7F9FC',
          'mid-dark': '#FFFFFF',
          'bg-3': '#F0F4F9',
          panel: '#FFFFFF',
          ink: '#111B21',
          silver: '#5E5E5E',
          'grey-body': '#5E5E5E',
          'grey-light': '#CDD0D5',
          green: '#25D366',        // WA bright — primary CTA
          'green-dark': '#075E54', // WA deepest teal — footer / deep bands
          'green-mid': '#1EBE5B',  // WA bright darker — hover on primary
          'green-teal': '#128C7E', // WA deep teal — secondary surfaces, dark CTA panels
          'green-sage': '#8FD9A4', // soft tint of WA green for backgrounds
          'green-pale-1': '#E6FFDA', // from WA CSS — light bubble bg
          'green-pale-2': '#F0FAF4',
          'green-pale-3': '#F5FCF7',
          accent: '#128C7E',       // deep teal — secondary details
          hover: '#1EBE5B',        // green hover (was cobalt blue)
          'hover-dark': '#075E54', // deepest teal — active/pressed
          border: '#CDD0D5',
          negative: '#E05362',
          warning: '#D98B1F',
          announcement: '#128C7E',
        },
        // WhatsApp-inspired palette — extracted from whatsapp.com production CSS 2026-04-16
        // Discipline: two greens (bright + deep teal). No third color.
        line: {
          green: '#25D366',         // WA bright — primary CTA, links
          'green-hover': '#1EBE5B', // hover state (darker bright)
          'green-deep': '#128C7E',  // WA deep teal — dark bands, secondary surfaces
          'green-deeper': '#075E54', // deepest — footer accent strips
          ink: '#111B21',           // all headings + body
          grey: '#5E5E5E',          // secondary text
          'grey-mute': '#CDD0D5',   // borders, hairlines, disabled
          'bg-alt': '#F0F4F9',      // section band bg
          'bg-alt-2': '#F7F9FC',    // alternating band bg
          paper: '#FFFFFF',
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
        marquee: 'marquee 120s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
