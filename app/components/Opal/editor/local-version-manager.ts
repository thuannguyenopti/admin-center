/**
 * LocalVersionManager — localStorage-backed version history for the canvas editor.
 *
 * Mirrors the interface of Imran's VersionManager but stores versions locally
 * instead of making HTTP calls to the relay. Used for the Opal prototype.
 */

import * as Y from 'yjs';
import { computeLineDiff, type DiffLine } from './diff-engine';

export interface LocalVersion {
  id: string;
  created_at: string;
  type: 'auto' | 'manual';
  label?: string;
  creator: string;
  content: string;
}

export type { DiffLine };

const STORAGE_KEY_PREFIX = 'opal-canvas-versions:';

export class LocalVersionManager {
  private _ydoc: Y.Doc;
  private _docId: string;
  private _versions: LocalVersion[] = [];

  constructor(ydoc: Y.Doc, documentId: string, initialContent?: string) {
    this._ydoc = ydoc;
    this._docId = documentId;

    // Try to restore from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + documentId);
      if (stored) this._versions = JSON.parse(stored);
    } catch { /* ignore */ }

    // Seed with mock versions so the panel isn't empty on first open
    if (this._versions.length === 0) {
      const content = initialContent ?? ydoc.getText('codemirror').toString();
      const now = Date.now();
      this._versions = [
        {
          id: 'v-seed-3',
          created_at: new Date(now - 7_200_000).toISOString(),
          type: 'manual',
          label: 'Initial draft',
          creator: 'Mary K.',
          content,
        },
        {
          id: 'v-seed-2',
          created_at: new Date(now - 3_600_000).toISOString(),
          type: 'auto',
          label: undefined,
          creator: 'system',
          content,
        },
        {
          id: 'v-seed-1',
          created_at: new Date(now - 600_000).toISOString(),
          type: 'manual',
          label: 'Added features section',
          creator: 'James S.',
          content,
        },
      ];
      this._persist();
    }
  }

  /** Save the current document state as a named version. */
  createVersion(label?: string, creator = 'You'): LocalVersion {
    const v: LocalVersion = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      type: 'manual',
      label,
      creator,
      content: this._ydoc.getText('codemirror').toString(),
    };
    this._versions.unshift(v);
    this._persist();
    return v;
  }

  /** Return all stored versions, newest first. */
  listVersions(): LocalVersion[] {
    return this._versions;
  }

  /** Compute a line-by-line diff between two versions. */
  diffVersions(v1: LocalVersion, v2: LocalVersion): DiffLine[] {
    return computeLineDiff(v1.content, v2.content);
  }

  /** Revert the Y.doc to a previous version's content (creates a new edit). */
  revertToVersion(version: LocalVersion): void {
    const ytext = this._ydoc.getText('codemirror');
    this._ydoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, version.content);
    });
  }

  private _persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + this._docId, JSON.stringify(this._versions));
    } catch { /* ignore storage full */ }
  }
}
