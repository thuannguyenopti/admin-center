import { ReactNode } from 'react';

// Base entity interface that all importable entities should extend
export interface BaseEntity {
  id: string;
  name: string;
  slug: string;
  visibility: 'public' | 'private';
  modifiedBy: string;
  usage: number;
  lastModified: string;
}

// Base form row interface
export interface BaseFormRow {
  id?: string;
  name: string;
  slug: string;
  visibility: 'public' | 'private';
}

// Generic parsed CSV row
export interface BaseParsedRow<TEntity extends BaseEntity> {
  name: string;
  slug: string;
  visibility: 'public' | 'private';
  rowNumber: number;
  status: 'valid' | 'error' | 'duplicate-in-csv' | 'exists-in-system';
  error?: string;
  conflictType?: 'exact-match' | 'slug-match';
  existingEntity?: TEntity;
}

// Import workflow steps
export type ImportStep = 'upload' | 'preview' | 'success';

// Import sources
export type ImportSource = 'csv' | 'url' | 'endpoint';

// Conflict resolution
export interface ConflictResolution {
  slug: string;
  action: 'skip' | 'update' | 'create-new';
  newSlug?: string;
}

// CSV parse result
export interface CSVParseResult<TParsedRow> {
  rows: TParsedRow[];
  stats: ParseStats;
}

// Parse statistics
export interface ParseStats {
  total: number;
  valid: number;
  duplicatesInCSV: number;
  existsInSystem: number;
  errors: number;
}

// Upload statistics
export interface UploadStats {
  created: number;
  updated: number;
  skipped: number;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Import warning
export interface ImportWarning {
  type: 'orphan' | 'circular' | 'depth' | 'custom';
  severity: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  affectedRows?: string[]; // slugs
  details?: ReactNode;
}

// Table column configuration
export interface TableColumnConfig<TParsedRow> {
  key: string;
  label: string;
  width?: string;
  render: (
    row: TParsedRow,
    originalIndex: number,
    allEntities: any[],
    resolutions: Map<string, ConflictResolution>,
    handleResolutionChange?: (slug: string, action: ConflictResolution['action'], newSlug?: string) => void
  ) => ReactNode;
  visible?: (row: TParsedRow) => boolean;
}

// Main import configuration interface
export interface ImportConfig<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
> {
  // Entity metadata
  entityName: string; // "category" | "tag"
  entityNamePlural: string; // "categories" | "tags"

  // CSV configuration
  csvHeaders: string[];
  templateData: string;

  // Parser function - entity-specific CSV parsing logic
  parseCSV: (file: File, existingEntities: TEntity[]) => Promise<CSVParseResult<TParsedRow>>;

  // Table configuration - defines preview table columns
  tableColumns: TableColumnConfig<TParsedRow>[];

  // Validation - additional entity-specific validation
  validateRow?: (
    row: TParsedRow,
    allRows: TParsedRow[],
    existingEntities: TEntity[]
  ) => ValidationResult;

  // Transform - convert parsed row to form row for import
  transformToFormRow: (
    row: TParsedRow,
    resolution?: ConflictResolution,
    allEntities?: TEntity[]
  ) => TFormRow | null;

  // Sort - optional sorting for dependency order (categories need this)
  sortForImport?: (
    rows: TParsedRow[],
    resolutions: Map<string, ConflictResolution>
  ) => TParsedRow[];

  // Warnings - detect issues like orphans (categories only)
  detectWarnings?: (
    rows: TParsedRow[],
    resolutions: Map<string, ConflictResolution>,
    existingEntities: TEntity[]
  ) => ImportWarning[];

  // JSON conversion - entity-specific JSON to CSV
  convertJsonToCsv?: (data: any[]) => string;
}

// File handlers interface for upload step
export interface FileHandlers {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleRemoveFile: () => void;
  handleUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndpointChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

// Conflict handlers interface for preview step
export interface ConflictHandlers {
  handleResolutionChange: (slug: string, action: ConflictResolution['action'], newSlug?: string) => void;
  handleBulkResolution: (action: 'skip' | 'update' | 'create-new' | 'manual') => void;
  defaultResolution: 'skip' | 'update' | 'create-new' | 'manual';
}

// Pagination interface for preview step
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentPageData: any[];
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

// URL validation state
export type ValidationState = 'valid' | 'invalid' | 'idle';
