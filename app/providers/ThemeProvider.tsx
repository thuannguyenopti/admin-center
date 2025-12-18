'use client';

import { ReactNode, memo, useLayoutEffect } from 'react';
import { AxiomProvider } from '@optiaxiom/react';
import { useTheme } from '@/app/hooks/useTheme';

type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeProviderComponent({ children }: ThemeProviderProps) {
  // Initialize theme on mount and listen for changes
  useTheme();
  
  // Additional safety net to ensure theme is applied before paint
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const html = document.documentElement;
      const body = document.body;
      
      // Only update if not already applied
      const currentTheme = html.hasAttribute('data-theme') ? html.getAttribute('data-theme') : 
                          html.classList.contains('dark') ? 'dark' : 'light';
      
      if (currentTheme !== theme) {
        html.setAttribute('data-theme', theme);
        html.classList.toggle('dark', theme === 'dark');
        html.style.colorScheme = theme;
        
        body.classList.toggle('dark', theme === 'dark');
        body.style.colorScheme = theme;
      }
    } catch (e) {}
  }, []);

  return (
    <AxiomProvider>
      {children}
    </AxiomProvider>
  );
}

// Memoize to prevent re-renders from parent navigation changes
export const ThemeProvider = memo(ThemeProviderComponent);
