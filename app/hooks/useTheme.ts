'use client';

import { useEffect, useState, useRef } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef<Theme>('light');

  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference first
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // Determine theme based on preference
    let currentTheme: Theme = 'light';

    if (savedTheme) {
      currentTheme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme = 'dark';
    }

    // Apply the theme
    themeRef.current = currentTheme;
    setTheme(currentTheme);
    applyTheme(currentTheme);

    // Listen for OS theme changes - ONLY if user hasn't manually set a preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      // Only apply OS change if no saved preference exists
      if (!localStorage.getItem('theme')) {
        themeRef.current = newTheme;
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    // Use addEventListener for better compatibility
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    if (newTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      body.classList.add('dark');
      body.style.colorScheme = 'dark';
    } else {
      html.removeAttribute('data-theme');
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      body.classList.remove('dark');
      body.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    themeRef.current = newTheme;
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    setTheme: (newTheme: Theme) => {
      if (newTheme !== themeRef.current) {
        themeRef.current = newTheme;
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      }
    },
    toggleTheme,
    mounted,
  };
}
