import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./app/opal/tools/lib/**",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        stride: {
          dark: '#1C1C1C',      // fg1 - primary text
          blue: '#0980F6',      // key1 - primary accent
          'blue-dark': '#0668C4', // hover state
          bg: '#F2F8FC',        // bg2 - secondary background
          light: '#FFFFFF',     // bg1 - light background
        }
      },
      fontFamily: {
        'stride-sans': ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'stride-base': ['14px', { lineHeight: '1.55' }],
        'stride-lg': ['16px', { lineHeight: '1.5' }],
        'stride-xl': ['20px', { lineHeight: '1.4' }],
        'stride-2xl': ['24px', { lineHeight: '1.3' }],
        'stride-3xl': ['32px', { lineHeight: '1.25' }],
        'stride-4xl': ['40px', { lineHeight: '1.2' }],
        'stride-5xl': ['48px', { lineHeight: '1.1' }],
        'stride-6xl': ['56px', { lineHeight: '1.0' }],
      },
      fontWeight: {
        'stride-normal': '400',
        'stride-medium': '500',
        'stride-semibold': '600',
        'stride-bold': '700',
        'stride-extrabold': '800',
      },
      borderRadius: {
        'stride': '8px',
        'stride-lg': '12px',
      }
    },
  },
  plugins: [],
} satisfies Config;
