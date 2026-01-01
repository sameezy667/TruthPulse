import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00FF94',
          DEFAULT: '#00FF94',
        },
        danger: {
          red: '#FF4444',
          DEFAULT: '#FF4444',
        },
      },
      letterSpacing: {
        'widest-custom': '0.3em',
        'tight-custom': '-0.025em',
      },
      spacing: {
        safe: 'env(safe-area-inset-top)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};

export default config;
