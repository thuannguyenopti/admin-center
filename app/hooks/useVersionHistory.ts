"use client";

import { useCallback, useEffect, useState } from 'react';

export type VersionSnapshot = {
  id: string;
  versionNumber: number;
  timestamp: number;
  author: string;
  customName?: string;
  label: string;
  status: 'published' | 'draft' | 'previously-published';
  variationId: string;
  variationName: string;
  isCurrent: boolean;
  changeSummary?: string;
  outlines: any[];
  properties: Record<string, any>;
};

export type PageVersionHistory = {
  pageId: string;
  versions: VersionSnapshot[];
};

const STORAGE_PREFIX = 'page_versions_';
const MAX_VERSIONS = 50; // Keep only the last 50 versions
const MAX_DRAFT_VERSIONS = 20; // Keep max 20 draft versions

/**
 * Get all versions for a page from localStorage
 */
function getVersionsFromStorage(pageId: string): VersionSnapshot[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = `${STORAGE_PREFIX}${pageId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];

    const parsed: PageVersionHistory = JSON.parse(data);
    return parsed.versions || [];
  } catch (error) {
    console.error(`Error reading versions for page ${pageId}:`, error);
    return [];
  }
}

/**
 * Save versions to localStorage
 */
function saveVersionsToStorage(pageId: string, versions: VersionSnapshot[]): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_PREFIX}${pageId}`;
    const data: PageVersionHistory = {
      pageId,
      versions,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving versions for page ${pageId}:`, error);
  }
}

/**
 * Trim old versions to stay within limits
 * Keeps the current version, recent published versions, and a limited number of drafts
 */
function trimVersions(versions: VersionSnapshot[]): VersionSnapshot[] {
  // Sort by timestamp (newest first)
  const sorted = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  // Always keep current version
  const current = sorted.find(v => v.isCurrent);

  // Keep all published and previously-published (up to limit)
  const published = sorted.filter(v => v.status === 'published' || v.status === 'previously-published');

  // Keep only recent drafts (up to MAX_DRAFT_VERSIONS)
  const drafts = sorted.filter(v => v.status === 'draft').slice(0, MAX_DRAFT_VERSIONS);

  // Combine all versions to keep
  const toKeep = new Set<string>();
  if (current) toKeep.add(current.id);
  published.forEach(v => toKeep.add(v.id));
  drafts.forEach(v => toKeep.add(v.id));

  // Keep only the versions in our set, in original order
  let kept = sorted.filter(v => toKeep.has(v.id));

  // If still over MAX_VERSIONS, keep only the most recent ones (but always keep current)
  if (kept.length > MAX_VERSIONS) {
    const currentVersion = kept.find(v => v.isCurrent);
    const others = kept.filter(v => !v.isCurrent).slice(0, MAX_VERSIONS - 1);
    kept = currentVersion ? [currentVersion, ...others] : others;
  }

  return kept;
}

/**
 * Hook for managing version history for a page
 */
export function useVersionHistory(pageId: string | undefined) {
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load versions on mount or when pageId changes
  useEffect(() => {
    if (!pageId) {
      setVersions([]);
      setIsLoaded(true);
      return;
    }

    const loaded = getVersionsFromStorage(pageId);
    setVersions(loaded);
    setIsLoaded(true);
  }, [pageId]);

  /**
   * Create a new version snapshot
   */
  const createVersion = useCallback((
    snapshot: Omit<VersionSnapshot, 'id' | 'versionNumber' | 'timestamp' | 'label'>
  ): VersionSnapshot => {
    if (!pageId) throw new Error('Cannot create version without pageId');

    const timestamp = Date.now();
    const versionNumber = versions.length + 1;
    const id = `v${versionNumber}-${timestamp}`;

    // Format label: "Feb 24, 2024 at 10:00 AM"
    const date = new Date(timestamp);
    const label = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Mark all existing versions as not current
    const updatedVersions = versions.map(v => ({
      ...v,
      isCurrent: false,
      // If this was published and we're creating a new published version, mark it as previously-published
      status: v.status === 'published' && snapshot.status === 'published'
        ? 'previously-published' as const
        : v.status,
    }));

    const newVersion: VersionSnapshot = {
      ...snapshot,
      id,
      versionNumber,
      timestamp,
      label,
    };

    let allVersions = [...updatedVersions, newVersion];

    // Trim old versions to stay within limits
    allVersions = trimVersions(allVersions);

    saveVersionsToStorage(pageId, allVersions);
    setVersions(allVersions);

    return newVersion;
  }, [pageId, versions]);

  /**
   * Delete a version
   */
  const deleteVersion = useCallback((versionId: string): boolean => {
    if (!pageId) return false;

    const version = versions.find(v => v.id === versionId);
    if (!version) return false;

    // Don't allow deleting the current version
    if (version.isCurrent) {
      console.warn('Cannot delete the current version');
      return false;
    }

    const filtered = versions.filter(v => v.id !== versionId);

    saveVersionsToStorage(pageId, filtered);
    setVersions(filtered);

    return true;
  }, [pageId, versions]);

  /**
   * Rename/tag a version with a custom name
   */
  const renameVersion = useCallback((versionId: string, customName: string): boolean => {
    if (!pageId) return false;

    const updated = versions.map(v =>
      v.id === versionId
        ? { ...v, customName: customName.trim() || undefined }
        : v
    );

    saveVersionsToStorage(pageId, updated);
    setVersions(updated);

    return true;
  }, [pageId, versions]);

  /**
   * Get a specific version by ID
   */
  const getVersion = useCallback((versionId: string): VersionSnapshot | null => {
    return versions.find(v => v.id === versionId) || null;
  }, [versions]);

  /**
   * Mark a version as current (used after restore)
   */
  const markAsCurrent = useCallback((versionId: string): boolean => {
    if (!pageId) return false;

    const updated = versions.map(v => ({
      ...v,
      isCurrent: v.id === versionId,
      // Mark old current as previously-published if it was published
      status: v.isCurrent && v.status === 'published'
        ? 'previously-published' as const
        : v.id === versionId && v.status === 'previously-published'
          ? 'published' as const
          : v.status,
    }));

    saveVersionsToStorage(pageId, updated);
    setVersions(updated);

    return true;
  }, [pageId, versions]);

  /**
   * Clear all version history for the page
   */
  const clearHistory = useCallback((): void => {
    if (!pageId) return;

    saveVersionsToStorage(pageId, []);
    setVersions([]);
  }, [pageId]);

  return {
    versions,
    isLoaded,
    createVersion,
    deleteVersion,
    renameVersion,
    getVersion,
    markAsCurrent,
    clearHistory,
  };
}
