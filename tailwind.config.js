/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Legacy aliases (kept for compatibility while we migrate)
        'primary-legacy': '#B71C1C',
        'primary-hover-legacy': '#7F0000',

        // M3 token ladder
        primary: {
          DEFAULT: '#91000A',
          container: '#B71C1C',
          hover: '#7F0000',
          tint: '#FDECEA',
          fixed: '#FFDAD6',
          'fixed-dim': '#FFB4AB',
        },
        'on-primary': '#FFFFFF',
        'on-primary-container': '#FFCAC4',
        'on-primary-fixed': '#410002',
        'on-primary-fixed-variant': '#93000B',

        secondary: {
          DEFAULT: '#5B5F64',
          container: '#DDE0E6',
        },
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#5F6368',

        tertiary: '#673B00',
        'tertiary-container': '#885000',
        'tertiary-fixed': '#FFDCBD',
        'tertiary-fixed-dim': '#FFB86E',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#FFCE9E',
        'on-tertiary-fixed': '#2C1600',
        'on-tertiary-fixed-variant': '#693C00',

        error: '#BA1A1A',
        'error-container': '#FFDAD6',
        'on-error': '#FFFFFF',
        'on-error-container': '#93000A',

        // Surfaces
        surface: {
          DEFAULT: '#FDF8FD',
          bright: '#FDF8FD',
          dim: '#DDD9DE',
          variant: '#E5E1E7',
          container: {
            DEFAULT: '#F1ECF2',
            lowest: '#FFFFFF',
            low: '#F7F2F8',
            high: '#EBE7EC',
            highest: '#E5E1E7',
          },
        },
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#5B403D',
        'inverse-surface': '#313034',
        'inverse-on-surface': '#F4EFF5',
        outline: '#8F706C',
        'outline-variant': '#E4BEB9',

        // Business aliases
        canvas: '#F6F5F4',
        line: '#E2E0DE',
        ink: { DEFAULT: '#1C1B1F', soft: '#5F6368' },
        success: { DEFAULT: '#2E7D32', bg: '#E8F5E9' },
        warning: { DEFAULT: '#B26A00', bg: '#FFF3E0' },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['"Roboto Flex"', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'elev-2': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
        topbar: '60px',
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
}
