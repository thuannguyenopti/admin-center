'use client';

import { ReactNode, memo } from 'react';
import { AxiomProvider } from '@optiaxiom/react';
import { useTheme } from '@/app/hooks/useTheme';

type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeProviderComponent({ children }: ThemeProviderProps) {
  // Initialize theme and listen for OS preference changes
  // This is the single source of truth for theme management
  useTheme();

  return (
    <AxiomProvider>
      {children}
    </AxiomProvider>
  );
}

// Memoize to prevent re-renders from parent navigation changes
export const ThemeProvider = memo(ThemeProviderComponent);