/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/client/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cyanotype': {
            'blue': '#002147',
            'dark': '#0a192f',
          },
          'primary': '#002147',
          'technical': {
            'white': '#E0E0E0',
          },
          'manila': {
            'tint': '#F5F5DC',
            'DEFAULT': '#F5F5DC',
          },
          'amber': {
            'glow': '#ffb100',
          },
          'background': {
            'light': '#f5f7f8',
            'dark': '#0f1823',
          },
        },
        fontFamily: {
          'mono': ['JetBrains Mono', 'monospace'],
          'sketch': ['Nanum Pen Script', 'cursive'],
          'display': ['Space Grotesk', 'sans-serif'],
        },
        animation: {
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
          'terminal-cursor': 'blink 1s step-end infinite',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
          'blink': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0' },
          },
        },
      },
    },
    plugins: [],
}
