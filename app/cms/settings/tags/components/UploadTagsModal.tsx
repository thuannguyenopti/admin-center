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
  Tooltip,
  SegmentedControl,
  SegmentedControlItem,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { Table, Tr, Th, Td } from '@/app/components/Table';
import { Tag, TagFormRow } from '../types';
import { useState, useEffect, useRef } from 'react';
import { parseTagsCSV, ParsedCSVRow, generateUniqueSlug } from '../utils';
import { IconUpload, IconCheck, IconAlertCircle, IconFile } from '@tabler/icons-react';

interface UploadTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: Tag[];
  onImport: (toCreate: TagFormRow[], toUpdate: TagFormRow[]) => void;
}

type Step = 'upload' | 'preview' | 'success';

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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [parseStats, setParseStats] = useState<any>(null);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [uploadStats, setUploadStats] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [defaultResolution, setDefaultResolution] = useState<'skip' | 'update' | 'create-new'>('skip');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('upload');
      setCsvFile(null);
      setParsedRows([]);
      setParseStats(null);
      setResolutions(new Map());
      setUploadStats(null);
      setParseError(null);
      setIsDragging(false);
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
    if (!csvFile) return;

    setIsLoading(true);
    setParseError(null);

    try {
      const result = await parseTagsCSV(csvFile, allTags);
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
      setParseError(error.message || 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolutionChange = (slug: string, action: 'skip' | 'update' | 'create-new') => {
    const newResolutions = new Map(resolutions);
    const resolution = newResolutions.get(slug);

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
  };

  const handleBulkResolution = (action: 'skip' | 'update' | 'create-new') => {
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

  const renderUploadStep = () => (
    <>
      <DialogHeader>
        <Text fontSize="xl" fontWeight="600">
          Import tags
        </Text>
      </DialogHeader>
      <DialogBody style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Box display="flex" flexDirection="column" gap="24">
          <Text fontSize="md">
            Import multiple tags by uploading a comma-separated values file (.csv). Preview your changes before confirming.
          </Text>

          {parseError && (
            <Alert intent="danger" rounded="md">
              <Box display="flex" alignItems="center" gap="8">
                <IconAlertCircle size={20} />
                <Text fontSize="sm">{parseError}</Text>
              </Box>
            </Alert>
          )}

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{
              border: csvFile
                ? '2px solid var(--ax-colors-border-success)'
                : isDragging
                  ? '2px dashed var(--ax-colors-border-accent)'
                  : '2px dashed var(--ax-colors-border-secondary)',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: csvFile
                ? 'var(--ax-colors-bg-success-subtlest)'
                : isDragging
                  ? 'var(--ax-colors-bg-accent-subtlest)'
                  : 'var(--ax-colors-bg-secondary)',
              transition: 'all 0.2s',
            }}
          >
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
                  {csvFile ? 'Click to select a different file' : 'or click to browse your files'}
                </Text>
              </Box>
              {!csvFile && (
                <Text fontSize="xs" color="fg.tertiary">
                  CSV files only, maximum 10MB
                </Text>
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
            disabled={!csvFile || isLoading}
            loading={isLoading}
          >
            Continue
          </Button>
        </Box>
      </DialogFooter>
    </>
  );

  const renderPreviewStep = () => {
    const errorRows = parsedRows.filter((r) => r.status === 'error');
    const conflictRows = parsedRows.filter((r) => r.status === 'exists-in-system');
    const duplicateRows = parsedRows.filter((r) => r.status === 'duplicate-in-csv');

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
        <DialogBody style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: '16px' }}>
          <Box display="flex" flexDirection="column" gap="24">
            {/* Summary stats */}
            <Alert intent="information" rounded="md">
              <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="md" fontWeight="600">
                  Found {parsedRows.length} {parsedRows.length === 1 ? 'tag' : 'tags'} in your file
                </Text>
                <Box display="flex" flexDirection="column" gap="4">
                  <Text fontSize="sm" style={{ whiteSpace: 'nowrap' }}>
                    {parseStats?.valid > 0 && `${parseStats.valid} ready to import`}
                    {conflictRows.length > 0 && `${parseStats?.valid > 0 ? ' • ' : ''}${conflictRows.length} ${conflictRows.length === 1 ? 'conflict' : 'conflicts'} (will ${defaultResolution === 'skip' ? 'skip' : defaultResolution === 'update' ? 'update' : 'create new'})`}
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

            {/* Preview table */}
            <Box display="flex" flexDirection="column" gap="16">
              <Box style={{ minHeight: '440px' }}>
                <Table>
                  <thead>
                    {/* Quick Actions Row - Only show when conflicts exist */}
                    {conflictRows.length > 0 && (
                      <Tr>
                        <th colSpan={6} style={{ borderBottom: 'none', padding: '12px 16px' }}>
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap="12">
                            <Text fontSize="sm" color="fg.secondary">
                              Apply action to all conflicts:
                            </Text>
                            <SegmentedControl
                              type="single"
                              value={defaultResolution}
                              onValueChange={(value: string) => handleBulkResolution(value as 'skip' | 'update' | 'create-new')}
                            >
                              <Tooltip content="Don't import conflicting tags - keep existing tags unchanged">
                                <SegmentedControlItem value="skip">Skip all</SegmentedControlItem>
                              </Tooltip>
                              <Tooltip content="Update existing tags with new data from your CSV file">
                                <SegmentedControlItem value="update">Update all</SegmentedControlItem>
                              </Tooltip>
                              <Tooltip content="Create new tags with automatically generated unique slugs">
                                <SegmentedControlItem value="create-new">Create with new slugs</SegmentedControlItem>
                              </Tooltip>
                            </SegmentedControl>
                          </Box>
                        </th>
                      </Tr>
                    )}

                    {/* Separator Row */}
                    {conflictRows.length > 0 && (
                      <Tr>
                        <th colSpan={6} style={{
                          borderTop: '2px solid var(--ax-colors-border-secondary)',
                          borderBottom: '2px solid var(--ax-colors-border-secondary)',
                          padding: 0,
                          height: '1px',
                          backgroundColor: 'var(--ax-colors-bg-secondary)'
                        }} />
                      </Tr>
                    )}

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
                      const resolution = resolutions.get(row.slug);
                      const bgColor =
                        row.status === 'error'
                          ? 'var(--ax-colors-bg-error-subtlest)'
                          : row.status === 'duplicate-in-csv'
                            ? 'var(--ax-colors-bg-warning-subtlest)'
                            : row.status === 'exists-in-system'
                              ? 'var(--ax-colors-bg-information-subtlest)'
                              : 'transparent';

                      return (
                        <Tr key={index} style={{ backgroundColor: bgColor }}>
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
                            {row.status === 'valid' && (
                              <Badge intent="success">Valid</Badge>
                            )}
                            {row.status === 'error' && (
                              <Badge intent="danger">Error</Badge>
                            )}
                            {row.status === 'duplicate-in-csv' && (
                              <Badge intent="warning">Duplicate</Badge>
                            )}
                            {row.status === 'exists-in-system' && (
                              <Badge intent="information">Conflict</Badge>
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
          maxWidth: step === 'preview' ? '1088px' : '736px',
          maxHeight: '80vh',
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
