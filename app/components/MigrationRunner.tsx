"use client";

import { useEffect } from 'react';
import { runTagsMigration } from '@/app/migrations/tagsMigration';

/**
 * Component that runs migrations on app load
 * Place this component at the root level to ensure migrations run before any data is accessed
 */
export function MigrationRunner() {
  useEffect(() => {
    // Run migrations on mount (client-side only)
    if (typeof window !== 'undefined') {
      runTagsMigration();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
