import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        severity: {
          low: {
            DEFAULT: '#EAB308',
            bg: '#FEF9C3',
            text: '#713F12',
          },
          medium: {
            DEFAULT: '#F97316',
            bg: '#FFEDD5',
            text: '#7C2D12',
          },
          high: {
            DEFAULT: '#EF4444',
            bg: '#FEE2E2',
            text: '#7F1D1D',
          },
          critical: {
            DEFAULT: '#991B1B',
            bg: '#FEE2E2',
            text: '#450A0A',
          },
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-dot': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [forms],
} satisfies Config;
