import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
  Button,
  Alert,
  Select,
  SelectTrigger,
  SelectContent,
  Badge,
  Pagination,
  Input,
  SegmentedControl,
  SegmentedControlItem,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { Table, Tr, Th, Td } from '@/app/components/Table';
import { Tag, TagFormRow } from '../types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseTagsCSV, ParsedCSVRow, generateUniqueSlug } from '../utils';
import { IconUpload, IconCheck, IconAlertCircle, IconFile, IconChevronUp, IconChevronDown, IconFileTypeCsv, IconLink, IconApi, IconX } from '@tabler/icons-react';

interface UploadTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: Tag[];
  onImport: (toCreate: TagFormRow[], toUpdate: TagFormRow[]) => void;
}

type Step = 'upload' | 'preview' | 'success';

type ImportSource = 'csv' | 'url' | 'endpoint';

interface ConflictResolution {
  slug: string;
  action: 'skip' | 'update' | 'create-new';
  newSlug?: string;
}

export function UploadTagsModal({
  open,
  onOpenChange,
  allTags,
  onImport,
}: UploadTagsModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [importSource, setImportSource] = useState<ImportSource>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('');
  const [urlValidation, setUrlValidation] = useState<'valid' | 'invalid' | 'idle'>('idle');
  const [endpointValidation, setEndpointValidation] = useState<'valid' | 'invalid' | 'idle'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [parseStats, setParseStats] = useState<any>(null);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [uploadStats, setUploadStats] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [defaultResolution, setDefaultResolution] = useState<'skip' | 'update' | 'create-new' | 'manual'>('skip');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusedIssueIndex, setFocusedIssueIndex] = useState<number | null>(null);
  const dialogBodyRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('upload');
      setImportSource('csv');
      setCsvFile(null);
      setUrlInput('');
      setEndpointInput('');
      setUrlValidation('idle');
      setEndpointValidation('idle');
      setParsedRows([]);
      setParseStats(null);
      setResolutions(new Map());
      setUploadStats(null);
      setParseError(null);
      setIsDragging(false);
      setFocusedIssueIndex(null);
    }
  }, [open]);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
      return () => {
        delete document.body.dataset.modalOpen;
      };
    }
  }, [open]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileValidation = (file: File) => {
    setParseError(null);

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setParseError('This file type is not supported. Please upload a CSV file (.csv)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setParseError('This file is too large. Please upload a CSV file smaller than 10MB');
      return;
    }

    setCsvFile(file);
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    setParseError(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;

    try {
      const urlObj = new URL(url);
      // Check for http or https protocol
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlInputChange = (value: string) => {
    setUrlInput(value);
    setParseError(null); // Clear any previous errors

    if (!value.trim()) {
      setUrlValidation('idle');
    } else if (validateUrl(value)) {
      setUrlValidation('valid');
    } else {
      setUrlValidation('invalid');
    }
  };

  const handleEndpointInputChange = (value: string) => {
    setEndpointInput(value);
    setParseError(null); // Clear any previous errors

    if (!value.trim()) {
      setEndpointValidation('idle');
    } else if (validateUrl(value)) {
      setEndpointValidation('valid');
    } else {
      setEndpointValidation('invalid');
    }
  };

  const handleImportSourceChange = (value: ImportSource) => {
    setImportSource(value);
    setParseError(null); // Clear errors when switching sources
  };

  const handleDownloadTemplate = () => {
    const template = `name,slug,visibility
Getting Started,getting-started,public
Advanced Guide,advanced-guide,private
Product Update,,public`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tags-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleParseCSV = async () => {
    setIsLoading(true);
    setParseError(null);

    try {
      let file: File | null = null;

      // Handle different import sources
      if (importSource === 'csv') {
        if (!csvFile) {
          setParseError('Please select a CSV file');
          setIsLoading(false);
          return;
        }
        file = csvFile;
      } else if (importSource === 'url') {
        if (!urlInput.trim()) {
          setParseError('Please enter a URL');
          setIsLoading(false);
          return;
        }
        // Fetch CSV from URL
        try {
          const response = await fetch(urlInput);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const blob = await response.blob();
          file = new File([blob], 'tags.csv', { type: 'text/csv' });
        } catch (error: any) {
          setParseError(`Failed to fetch from URL: ${error.message}`);
          setIsLoading(false);
          return;
        }
      } else if (importSource === 'endpoint') {
        if (!endpointInput.trim()) {
          setParseError('Please enter an API endpoint');
          setIsLoading(false);
          return;
        }
        // Fetch from API endpoint
        try {
          const response = await fetch(endpointInput);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const contentType = response.headers.get('content-type');

          // Handle both CSV and JSON responses
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            // Convert JSON to CSV format
            // Expecting array of objects with name, slug?, visibility? properties
            const csvContent = convertJsonToCsv(data);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            file = new File([blob], 'tags.csv', { type: 'text/csv' });
          } else {
            const blob = await response.blob();
            file = new File([blob], 'tags.csv', { type: 'text/csv' });
          }
        } catch (error: any) {
          setParseError(`Failed to fetch from endpoint: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      if (!file) {
        setParseError('No file to parse');
        setIsLoading(false);
        return;
      }

      const result = await parseTagsCSV(file, allTags);
      setParsedRows(result.rows);
      setParseStats(result.stats);

      // Initialize default resolutions for conflicts
      const newResolutions = new Map<string, ConflictResolution>();
      result.rows.forEach((row) => {
        if (row.status === 'exists-in-system') {
          newResolutions.set(row.slug, {
            slug: row.slug,
            action: 'skip',
          });
        }
      });
      setResolutions(newResolutions);
      setCurrentPage(1);

      setStep('preview');
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert JSON array to CSV
  const convertJsonToCsv = (data: any): string => {
    if (!Array.isArray(data)) {
      throw new Error('Expected JSON array of tags');
    }

    const headers = ['name', 'slug', 'visibility'];
    const rows = data.map((item: any) => {
      return [
        item.name || '',
        item.slug || '',
        item.visibility || 'public',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleResolutionChange = (slug: string, action: 'skip' | 'update' | 'create-new') => {
    const newResolutions = new Map(resolutions);

    if (action === 'create-new') {
      const csvSlugs = new Set(parsedRows.map((r) => r.slug));
      const newSlug = generateUniqueSlug(slug, allTags, csvSlugs);
      newResolutions.set(slug, {
        slug,
        action,
        newSlug,
      });
    } else {
      newResolutions.set(slug, {
        slug,
        action,
      });
    }

    setResolutions(newResolutions);

    // After updating resolutions, check if all conflict resolutions match a single action
    // If they all match one action, set that as the bulk action
    // Otherwise, set it to 'manual'
    const allActions = Array.from(newResolutions.values()).map((res) => res.action);
    const uniqueActions = new Set(allActions);

    if (uniqueActions.size === 1) {
      // All conflicts have the same action
      const singleAction = allActions[0];
      setDefaultResolution(singleAction);
    } else {
      // Mixed actions - set to manual
      setDefaultResolution('manual');
    }
  };

  const handleBulkResolution = (action: 'skip' | 'update' | 'create-new' | 'manual') => {
    // If manual is selected, don't change any resolutions
    if (action === 'manual') {
      return;
    }

    setDefaultResolution(action);

    const newResolutions = new Map<string, ConflictResolution>();
    const csvSlugs = new Set(parsedRows.map((r) => r.slug));

    parsedRows.forEach((row) => {
      if (row.status === 'exists-in-system') {
        if (action === 'create-new') {
          const newSlug = generateUniqueSlug(row.slug, allTags, csvSlugs);
          newResolutions.set(row.slug, {
            slug: row.slug,
            action,
            newSlug,
          });
        } else {
          newResolutions.set(row.slug, {
            slug: row.slug,
            action,
          });
        }
      }
    });

    setResolutions(newResolutions);
  };

  const handleImport = () => {
    const toCreate: TagFormRow[] = [];
    const toUpdate: TagFormRow[] = [];

    parsedRows.forEach((row) => {
      if (row.status === 'valid') {
        toCreate.push({
          name: row.name,
          slug: row.slug,
          visibility: row.visibility,
        });
      } else if (row.status === 'exists-in-system') {
        const resolution = resolutions.get(row.slug);
        if (!resolution) return;

        if (resolution.action === 'update' && row.existingTag) {
          toUpdate.push({
            id: row.existingTag.id,
            name: row.name,
            slug: row.slug,
            visibility: row.visibility,
          });
        } else if (resolution.action === 'create-new' && resolution.newSlug) {
          toCreate.push({
            name: row.name,
            slug: resolution.newSlug,
            visibility: row.visibility,
          });
        }
        // skip: do nothing
      }
    });

    const skipped = parsedRows.filter((row) => {
      if (row.status === 'error' || row.status === 'duplicate-in-csv') return true;
      if (row.status === 'exists-in-system') {
        const resolution = resolutions.get(row.slug);
        return resolution?.action === 'skip';
      }
      return false;
    }).length;

    onImport(toCreate, toUpdate);

    setUploadStats({
      created: toCreate.length,
      updated: toUpdate.length,
      skipped,
    });

    setStep('success');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Get all conflict rows that need user decisions
  const getConflictRows = useCallback(() => {
    return parsedRows
      .map((row, index) => ({ row, originalIndex: index }))
      .filter(({ row }) => row.status === 'exists-in-system');
  }, [parsedRows]);

  // Navigate to next/previous conflict
  const navigateToConflict = useCallback((direction: 'next' | 'prev') => {
    const conflictRows = getConflictRows();
    if (conflictRows.length === 0) return;

    let newIndex: number;
    if (focusedIssueIndex === null) {
      newIndex = direction === 'next' ? 0 : conflictRows.length - 1;
    } else {
      newIndex = direction === 'next'
        ? (focusedIssueIndex + 1) % conflictRows.length
        : (focusedIssueIndex - 1 + conflictRows.length) % conflictRows.length;
    }

    setFocusedIssueIndex(newIndex);

    // Calculate which page this conflict is on
    const originalIndex = conflictRows[newIndex].originalIndex;
    const targetPage = Math.floor(originalIndex / itemsPerPage) + 1;

    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }

    // Scroll to the row after a brief delay to allow page change
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-row-index="${originalIndex}"]`);
      if (rowElement && dialogBodyRef.current) {
        rowElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }, [focusedIssueIndex, getConflictRows, currentPage, itemsPerPage]);

  // Keyboard navigation
  useEffect(() => {
    if (step !== 'preview') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/select
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        navigateToConflict('next');
      } else if (e.key === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        navigateToConflict('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, navigateToConflict]);

  const renderUploadStep = () => {
    const canContinue =
      (importSource === 'csv' && csvFile) ||
      (importSource === 'url' && urlInput.trim() && urlValidation === 'valid') ||
      (importSource === 'endpoint' && endpointInput.trim() && endpointValidation === 'valid');

    return (
      <>
        <DialogHeader>
          <Text fontSize="xl" fontWeight="600">
            Import tags
          </Text>
        </DialogHeader>
        <DialogBody style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Box display="flex" flexDirection="column" gap="24" w="full">
            <Text fontSize="md" maxW="full">
              Import multiple tags from different sources. Preview your changes before confirming.
            </Text>

            {/* Import Source Selector */}
            <Box display="flex" flexDirection="column" gap="12">
              <Text fontSize="sm" fontWeight="600">
                Import source
              </Text>
              <SegmentedControl
                value={importSource}
                onValueChange={(value: string) => {
                  if (value) handleImportSourceChange(value as ImportSource);
                }}
              >
                <SegmentedControlItem value="csv">
                  <Box display="flex" alignItems="center" gap="8">
                    <IconFileTypeCsv size={16} />
                    <Text>CSV File</Text>
                  </Box>
                </SegmentedControlItem>
                <SegmentedControlItem value="url">
                  <Box display="flex" alignItems="center" gap="8">
                    <IconLink size={16} />
                    <Text>URL</Text>
                  </Box>
                </SegmentedControlItem>
                <SegmentedControlItem value="endpoint">
                  <Box display="flex" alignItems="center" gap="8">
                    <IconApi size={16} />
                    <Text>API Endpoint</Text>
                  </Box>
                </SegmentedControlItem>
              </SegmentedControl>
            </Box>

            {parseError && (
              <Alert intent="danger" rounded="md">
                <Box display="flex" alignItems="center" gap="8">
                  <IconAlertCircle size={20} />
                  <Text fontSize="sm">{parseError}</Text>
                </Box>
              </Alert>
            )}

            {/* CSV Upload UI */}
            {importSource === 'csv' && (
              <>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={csvFile ? undefined : triggerFileInput}
                  style={{
                    border: csvFile
                      ? '2px solid var(--ax-colors-border-success)'
                      : isDragging
                        ? '2px dashed var(--ax-colors-border-accent)'
                        : '2px dashed var(--ax-colors-border-secondary)',
                    borderRadius: '8px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: csvFile ? 'default' : 'pointer',
                    backgroundColor: csvFile
                      ? 'var(--ax-colors-bg-success-subtlest)'
                      : isDragging
                        ? 'var(--ax-colors-bg-accent-subtlest)'
                        : 'var(--ax-colors-bg-secondary)',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {csvFile && (
                    <Box
                      style={{ position: 'absolute', top: '12px', right: '12px' }}
                    >
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        aria-label="Remove file"
                      >
                        <IconX size={16} />
                      </Button>
                    </Box>
                  )}
                  <Box display="flex" flexDirection="column" alignItems="center" gap="12">
                    {csvFile ? (
                      <IconFile size={48} style={{ color: 'var(--ax-colors-fg-success)' }} />
                    ) : (
                      <IconUpload size={48} style={{ color: 'var(--ax-colors-fg-tertiary)' }} />
                    )}
                    <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                      <Text fontSize="lg" fontWeight="600" color={csvFile ? 'fg.success' : 'fg.default'}>
                        {csvFile ? csvFile.name : 'Drag and drop your CSV file here'}
                      </Text>
                      <Text fontSize="sm" color="fg.secondary">
                        {csvFile ? 'File ready to import' : 'or click to browse your files'}
                      </Text>
                    </Box>
                    {!csvFile ? (
                      <Text fontSize="xs" color="fg.tertiary">
                        CSV files only, maximum 10MB
                      </Text>
                    ) : (
                      <Button appearance="default" size="sm" onClick={triggerFileInput}>
                        Choose different file
                      </Button>
                    )}
                  </Box>
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                <Box display="flex" alignItems="center" justifyContent="center" gap="12" flexWrap="wrap">
                  <Text fontSize="sm" color="fg.secondary">
                    Your file needs: <Text asChild fontWeight="600"><span>name</span></Text> (required), <Text asChild fontWeight="600"><span>slug</span></Text> and <Text asChild fontWeight="600"><span>visibility</span></Text> (optional).
                  </Text>
                  <Button appearance="default" size="sm" onClick={handleDownloadTemplate}>
                    Download template
                  </Button>
                </Box>
              </>
            )}

            {/* URL Input UI */}
            {importSource === 'url' && (
              <Box display="flex" flexDirection="column" gap="12">
                <Box display="flex" flexDirection="column" gap="8">
                  <Text fontSize="sm" fontWeight="600">
                    CSV URL
                  </Text>
                  <Box display="flex" flexDirection="column" gap="4">
                    <Input
                      type="url"
                      placeholder="https://example.com/tags.csv"
                      value={urlInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUrlInputChange(e.target.value)}
                      style={{
                        borderColor:
                          urlValidation === 'valid'
                            ? 'var(--ax-colors-border-success)'
                            : urlValidation === 'invalid'
                              ? 'var(--ax-colors-border-danger)'
                              : undefined,
                      }}
                    />
                    {urlValidation === 'invalid' && (
                      <Text fontSize="xs" color="fg.error">
                        Please enter a valid URL starting with http:// or https://
                      </Text>
                    )}
                    {urlValidation === 'valid' && (
                      <Text fontSize="xs" color="fg.success">
                        Valid URL format
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="xs" color="fg.secondary">
                    Enter a direct URL to a CSV file containing your tags.
                  </Text>
                </Box>
                <Alert intent="information" rounded="md">
                  <Box display="flex" flexDirection="column" gap="4">
                    <Text fontSize="sm" fontWeight="600">
                      CSV Format
                    </Text>
                    <Text fontSize="xs" color="fg.secondary">
                      The CSV should have columns: <Text asChild fontWeight="600"><span>name</span></Text> (required), <Text asChild fontWeight="600"><span>slug</span></Text> and <Text asChild fontWeight="600"><span>visibility</span></Text> (optional).
                    </Text>
                  </Box>
                </Alert>
              </Box>
            )}

            {/* Endpoint Input UI */}
            {importSource === 'endpoint' && (
              <Box display="flex" flexDirection="column" gap="12">
                <Box display="flex" flexDirection="column" gap="8">
                  <Text fontSize="sm" fontWeight="600">
                    API Endpoint
                  </Text>
                  <Box display="flex" flexDirection="column" gap="4">
                    <Input
                      type="url"
                      placeholder="https://api.example.com/tags"
                      value={endpointInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEndpointInputChange(e.target.value)}
                      style={{
                        borderColor:
                          endpointValidation === 'valid'
                            ? 'var(--ax-colors-border-success)'
                            : endpointValidation === 'invalid'
                              ? 'var(--ax-colors-border-danger)'
                              : undefined,
                      }}
                    />
                    {endpointValidation === 'invalid' && (
                      <Text fontSize="xs" color="fg.error">
                        Please enter a valid URL starting with http:// or https://
                      </Text>
                    )}
                    {endpointValidation === 'valid' && (
                      <Text fontSize="xs" color="fg.success">
                        Valid URL format
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="xs" color="fg.secondary">
                    Enter an API endpoint that returns tags in CSV or JSON format.
                  </Text>
                </Box>
                <Alert intent="information" rounded="md">
                  <Box display="flex" flexDirection="column" gap="8">
                    <Box display="flex" flexDirection="column" gap="4">
                      <Text fontSize="sm" fontWeight="600">
                        Supported Formats
                      </Text>
                      <Text fontSize="xs" color="fg.secondary">
                        <Text asChild fontWeight="600"><span>CSV:</span></Text> Should have columns: name, slug, visibility
                      </Text>
                      <Text fontSize="xs" color="fg.secondary">
                        <Text asChild fontWeight="600"><span>JSON:</span></Text> Should be an array of objects with properties: name, slug, visibility
                      </Text>
                    </Box>
                    <Box display="flex" flexDirection="column" gap="2">
                      <Text fontSize="xs" color="fg.tertiary">
                        Example JSON response:
                      </Text>
                      <Box
                        p="8"
                        style={{
                          backgroundColor: 'var(--ax-colors-bg-secondary)',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                      >
                        <Text fontSize="xs" fontFamily="mono" color="fg.secondary">
                          {'[{"name": "Getting Started", "slug": "getting-started", "visibility": "public"}]'}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Alert>
              </Box>
            )}
          </Box>
        </DialogBody>
        <DialogFooter>
          <Box display="flex" gap="16" justifyContent="flex-end" w="full">
            <DialogClose asChild>
              <Button appearance="default" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              appearance="primary"
              size="lg"
              onClick={handleParseCSV}
              disabled={!canContinue || isLoading}
              loading={isLoading}
            >
              Continue
            </Button>
          </Box>
        </DialogFooter>
      </>
    );
  };

  const renderPreviewStep = () => {
    const errorRows = parsedRows.filter((r) => r.status === 'error');
    const conflictRows = parsedRows.filter((r) => r.status === 'exists-in-system');
    const duplicateRows = parsedRows.filter((r) => r.status === 'duplicate-in-csv');
    const conflictRowsWithIndex = getConflictRows();

    // Pagination
    const totalPages = Math.ceil(parsedRows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = parsedRows.slice(startIndex, endIndex);

    return (
      <>
        <DialogHeader>
          <Text fontSize="xl" fontWeight="600">
            Preview import ({parsedRows.length})
          </Text>
        </DialogHeader>
        <DialogBody ref={dialogBodyRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingTop: '16px', width: '100%' }}>
          <Box display="flex" flexDirection="column" gap="24" style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
            {/* Summary stats */}
            <Alert intent="information" rounded="md">
              <Box display="flex" flexDirection="column" gap="12">
                <Text fontSize="md" fontWeight="600">
                  Found {parsedRows.length} {parsedRows.length === 1 ? 'tag' : 'tags'} in your file
                </Text>
                <Box display="flex" flexDirection="column" gap="4">
                  <Text fontSize="sm" style={{ whiteSpace: 'nowrap' }}>
                    {parseStats?.valid > 0 && `${parseStats.valid} ready to import`}
                    {conflictRows.length > 0 && `${parseStats?.valid > 0 ? ' • ' : ''}${conflictRows.length} ${conflictRows.length === 1 ? 'conflict' : 'conflicts'} (${defaultResolution === 'manual' ? 'manual' : `will ${defaultResolution === 'skip' ? 'skip' : defaultResolution === 'update' ? 'update' : 'create new'}`})`}
                    {duplicateRows.length > 0 && `${(parseStats?.valid > 0 || conflictRows.length > 0) ? ' • ' : ''}${duplicateRows.length} ${duplicateRows.length === 1 ? 'duplicate' : 'duplicates'} (using first)`}
                    {errorRows.length > 0 && `${(parseStats?.valid > 0 || conflictRows.length > 0 || duplicateRows.length > 0) ? ' • ' : ''}${errorRows.length} ${errorRows.length === 1 ? 'error' : 'errors'} (will skip)`}
                  </Text>

                  {/* Error details - collapsible */}
                  {errorRows.length > 0 && (
                    <Box display="flex" flexDirection="column" gap="4">
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="8"
                        onClick={() => setShowErrorDetails(!showErrorDetails)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Text fontSize="xs" color="fg.secondary">
                          {showErrorDetails ? 'Hide error details' : 'Show error details'}
                        </Text>
                      </Box>
                      {showErrorDetails && (
                        <Box display="flex" flexDirection="column" gap="2" pl="8">
                          {errorRows.slice(0, 5).map((row, idx) => (
                            <Text key={idx} fontSize="xs" color="fg.error">
                              Row {row.rowNumber}: {row.error}
                            </Text>
                          ))}
                          {errorRows.length > 5 && (
                            <Text fontSize="xs" color="fg.secondary">
                              and {errorRows.length - 5} more {errorRows.length - 5 === 1 ? 'error' : 'errors'}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

              </Box>
            </Alert>

            {/* Conflict Actions Toolbar - Separate from table */}
            {conflictRows.length > 0 && (
              <Box
                p="12"
                style={{
                  borderRadius: '6px',
                  border: '1px solid var(--ax-colors-border-tertiary)',
                  background: 'var(--ax-colors-bg-default)',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="12"
                  style={{ minWidth: 0 }}
                >
                  <Box display="flex" alignItems="center" gap="8" style={{ flex: '0 1 auto', minWidth: 0 }}>
                    <Text fontSize="sm" color="fg.secondary">
                      {focusedIssueIndex !== null
                        ? `Conflict ${focusedIssueIndex + 1} of ${conflictRowsWithIndex.length}`
                        : 'Conflict navigation'}
                    </Text>
                    <Box display="flex" gap="4" style={{ flexShrink: 0 }}>
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => navigateToConflict('prev')}
                        disabled={conflictRowsWithIndex.length === 0}
                      >
                        <IconChevronUp size={16} />
                      </Button>
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => navigateToConflict('next')}
                        disabled={conflictRowsWithIndex.length === 0}
                      >
                        <IconChevronDown size={16} />
                      </Button>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap="12" style={{ flexShrink: 0 }}>
                    <Text fontSize="sm" color="fg.secondary">
                      Bulk action:
                    </Text>
                    <Select
                      value={defaultResolution}
                      onValueChange={(value) => handleBulkResolution(value as 'skip' | 'update' | 'create-new' | 'manual')}
                      options={[
                        { label: 'Skip', value: 'skip' },
                        { label: 'Update', value: 'update' },
                        { label: 'Create new', value: 'create-new' },
                        { label: 'Manual', value: 'manual' },
                      ]}
                    >
                      <SelectTrigger size="sm" style={{ minWidth: '140px' }}>
                        {defaultResolution === 'skip' && 'Skip'}
                        {defaultResolution === 'update' && 'Update'}
                        {defaultResolution === 'create-new' && 'Create new'}
                        {defaultResolution === 'manual' && 'Manual'}
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Preview table - scroll horizontally so toolbar above stays within modal width */}
            <Box display="flex" flexDirection="column" gap="16" style={{ minWidth: 0 }}>
              <Box style={{ overflowX: 'auto', minWidth: 0 }}>
                <Table>
                  <thead>
                    {/* Column Headers Row */}
                    <Tr>
                      <Th style={{ width: '56px' }}>#</Th>
                      <Th style={{ width: '220px' }}>Name</Th>
                      <Th style={{ width: '220px' }}>Slug</Th>
                      <Th style={{ width: '120px' }}>Visibility</Th>
                      <Th style={{ width: '120px' }}>Status</Th>
                      <Th style={{ width: 'auto' }}>Action</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((row, index) => {
                      const originalIndex = startIndex + index;
                      const resolution = resolutions.get(row.slug);
                      const isConflict = row.status === 'exists-in-system';
                      const conflictIndex = isConflict ? conflictRowsWithIndex.findIndex(({ originalIndex: idx }: { originalIndex: number }) => idx === originalIndex) : -1;
                      const isFocused = focusedIssueIndex !== null && conflictIndex === focusedIssueIndex;

                      const baseBgColor =
                        row.status === 'error'
                          ? 'var(--ax-colors-bg-error-subtlest)'
                          : row.status === 'duplicate-in-csv'
                            ? 'var(--ax-colors-bg-information-subtlest)'
                            : row.status === 'exists-in-system'
                              ? 'var(--ax-colors-bg-warning-subtlest)'
                              : 'transparent';

                      const bgColor = isFocused ? 'var(--ax-colors-bg-accent-subtle)' : baseBgColor;

                      return (
                        <Tr
                          key={index}
                          data-row-index={originalIndex}
                          style={{
                            backgroundColor: bgColor,
                            position: 'relative',
                            transition: 'background-color 0.2s ease-in-out',
                          }}
                        >
                          <Td style={{ width: '56px', verticalAlign: 'middle' }}>
                            <Text fontSize="sm" color="fg.secondary">
                              {row.rowNumber}
                            </Text>
                          </Td>
                          <Td style={{ width: '220px', verticalAlign: 'middle' }}>{row.name}</Td>
                          <Td style={{ width: '220px', verticalAlign: 'middle' }}>
                            <Text fontSize="sm" fontFamily="mono" color="fg.secondary">
                              /{row.slug}
                            </Text>
                          </Td>
                          <Td style={{ width: '120px', verticalAlign: 'middle' }}>
                            <Text fontSize="sm" style={{ textTransform: 'capitalize' }}>
                              {row.visibility}
                            </Text>
                          </Td>
                          <Td style={{ width: '120px', verticalAlign: 'middle' }}>
                            {row.status === 'error' && (
                              <Badge intent="danger">Error</Badge>
                            )}
                            {row.status === 'duplicate-in-csv' && (
                              <Badge intent="information">Duplicate</Badge>
                            )}
                            {row.status === 'exists-in-system' && (
                              <Badge intent="warning">Conflict</Badge>
                            )}
                          </Td>
                          <Td style={{ width: 'auto', verticalAlign: 'middle' }}>
                            {row.status === 'exists-in-system' && (
                              <Box display="flex" flexDirection="column" gap="4">
                                <Select
                                  value={resolution?.action || 'skip'}
                                  onValueChange={(value) =>
                                    handleResolutionChange(
                                      row.slug,
                                      value as 'skip' | 'update' | 'create-new'
                                    )
                                  }
                                  options={[
                                    { label: 'Skip', value: 'skip' },
                                    { label: 'Update', value: 'update' },
                                    { label: 'Create new', value: 'create-new' },
                                  ]}
                                >
                                  <SelectTrigger size="sm">
                                    {resolution?.action === 'skip' && 'Skip'}
                                    {resolution?.action === 'update' && 'Update'}
                                    {resolution?.action === 'create-new' && 'Create new'}
                                    {!resolution?.action && 'Skip'}
                                  </SelectTrigger>
                                  <SelectContent />
                                </Select>
                                {resolution?.action === 'create-new' && resolution.newSlug && (
                                  <Text fontSize="xs" color="fg.secondary">
                                    Will create with slug: /{resolution.newSlug}
                                  </Text>
                                )}
                                {row.existingTag && (
                                  <Text fontSize="xs" color="fg.secondary">
                                    Existing tag: {row.existingTag.name} • {row.existingTag.visibility}
                                  </Text>
                                )}
                              </Box>
                            )}
                            {row.status === 'error' && row.error && (
                              <Text fontSize="xs" color="fg.error">
                                {row.error}
                              </Text>
                            )}
                            {row.status === 'duplicate-in-csv' && (
                              <Text fontSize="xs" color="fg.warning">
                                Duplicate found - only the first will be imported
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Box>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box display="flex" alignItems="center" justifyContent="space-between" gap="16">
                  <Text fontSize="sm" color="fg.secondary">
                    Showing {startIndex + 1}-{Math.min(endIndex, parsedRows.length)} of {parsedRows.length}
                  </Text>
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Box display="flex" gap="16" justifyContent="flex-end" w="full">
            <Button appearance="default" size="lg" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button
              appearance="primary"
              size="lg"
              onClick={handleImport}
              disabled={parseStats?.valid === 0 && conflictRows.length === 0}
            >
              Import tags
            </Button>
          </Box>
        </DialogFooter>
      </>
    );
  };

  const renderSuccessStep = () => {
    return (
      <>
        <DialogHeader>
          <Text fontSize="xl" fontWeight="600">
            Import Complete
          </Text>
        </DialogHeader>
        <DialogBody>
          <Box display="flex" flexDirection="column" alignItems="center" gap="24" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            <IconCheck size={64} style={{ color: 'var(--ax-colors-fg-success)' }} />
            <Box display="flex" flexDirection="column" alignItems="center" gap="12">
              <Text fontSize="lg" fontWeight="600">
                Your tags have been imported successfully
              </Text>
              <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                {(uploadStats?.created || 0) > 0 && (
                  <Text fontSize="md" color="fg.secondary">
                    {uploadStats?.created} new {uploadStats?.created === 1 ? 'tag' : 'tags'} created
                  </Text>
                )}
                {(uploadStats?.updated || 0) > 0 && (
                  <Text fontSize="md" color="fg.secondary">
                    {uploadStats?.updated} existing {uploadStats?.updated === 1 ? 'tag' : 'tags'} updated
                  </Text>
                )}
                {(uploadStats?.skipped || 0) > 0 && (
                  <Text fontSize="md" color="fg.secondary">
                    {uploadStats?.skipped} {uploadStats?.skipped === 1 ? 'tag' : 'tags'} skipped
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Box display="flex" justifyContent="flex-end" w="full">
            <Button appearance="primary" size="lg" onClick={handleClose}>
              Done
            </Button>
          </Box>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        style={{
          width: '100%',
          maxWidth: step === 'preview' ? '1088px' : '736px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}
