'use client';

import { ReactNode } from 'react';
import { AxiomProvider } from '@optiaxiom/react';
import { useTheme } from '@/app/hooks/useTheme';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // useTheme hook will handle the theme detection and application
  // It sets data-theme and color-scheme on the HTML element
  useTheme();

  return (
    <AxiomProvider>
      {children}
    </AxiomProvider>
  );
}