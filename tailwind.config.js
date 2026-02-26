/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0037ff',
        'dark-navy': '#080736',
        'selected-bg': '#f0f3ff',
        'text-secondary': '#707070',
        'text-highlight': '#222222',
        'border-gray': '#9e9e9e',
        'border-tertiary': '#ededed',
        'border-divider': '#d6d6d6',
        'sidebar-bg': '#fafafa',
      },
      fontFamily: {
        'hack': ['Hack', 'monospace'],
      },
    },
  },
  plugins: [],
}
