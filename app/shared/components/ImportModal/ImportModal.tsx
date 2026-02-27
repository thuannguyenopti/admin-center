import { Dialog, DialogContent } from '@optiaxiom/react';
import { useEffect, useState, useCallback } from 'react';
import {
  BaseEntity,
  BaseFormRow,
  BaseParsedRow,
  ImportConfig,
} from './types';
import { useFileUpload } from '@/app/shared/hooks/useFileUpload';
import { usePagination } from '@/app/shared/hooks/usePagination';
import { useConflictResolution } from '@/app/shared/hooks/useConflictResolution';
import { useImportWorkflow } from '@/app/shared/hooks/useImportWorkflow';
import { fetchFileFromSource } from '@/app/shared/utils/import';
import { UploadStep } from './steps/UploadStep';
import { PreviewStep } from './steps/PreviewStep';
import { SuccessStep } from './steps/SuccessStep';

export interface ImportModalProps<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allEntities: TEntity[];
  onImport: (toCreate: TFormRow[], toUpdate: TFormRow[]) => void;
  config: ImportConfig<TEntity, TFormRow, TParsedRow>;
}

export function ImportModal<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
>({
  open,
  onOpenChange,
  allEntities,
  onImport,
  config,
}: ImportModalProps<TEntity, TFormRow, TParsedRow>) {
  // Workflow state
  const {
    step,
    setStep,
    isLoading,
    setIsLoading,
    parseError,
    setParseError,
    uploadStats,
    setUploadStats,
    resetWorkflow,
  } = useImportWorkflow();

  // File upload state
  const fileUpload = useFileUpload(setParseError);

  // Parsed data state
  const [parsedRows, setParsedRows] = useState<TParsedRow[]>([]);
  const [parseStats, setParseStats] = useState({
    total: 0,
    valid: 0,
    duplicatesInCSV: 0,
    existsInSystem: 0,
    errors: 0,
  });

  // Pagination
  const pagination = usePagination(parsedRows, 5);

  // Conflict resolution
  const conflictResolution = useConflictResolution(allEntities, parsedRows);

  // Error details visibility
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      resetWorkflow();
      fileUpload.resetFileUpload();
      setParsedRows([]);
      setParseStats({
        total: 0,
        valid: 0,
        duplicatesInCSV: 0,
        existsInSystem: 0,
        errors: 0,
      });
      conflictResolution.resetConflictResolution();
      pagination.resetPagination();
      setShowErrorDetails(false);

      // Prevent scrolling on body when modal is open
      document.body.dataset.modalOpen = 'true';
    } else {
      // Re-enable scrolling when modal closes
      delete document.body.dataset.modalOpen;
    }
  }, [open]);

  // Parse CSV file
  const handleParseCSV = async () => {
    setIsLoading(true);
    setParseError(null);

    try {
      const file = await fetchFileFromSource(
        fileUpload.importSource,
        fileUpload.csvFile,
        fileUpload.urlInput,
        fileUpload.endpointInput,
        config.convertJsonToCsv,
        config.entityName
      );

      const result = await config.parseCSV(file, allEntities);
      setParsedRows(result.rows);
      setParseStats(result.stats);

      // Initialize conflict resolutions
      conflictResolution.initializeResolutions(result.rows);

      setStep('preview');
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import
  const handleImport = () => {
    // Sort if needed (categories need topological sort)
    const sortedRows = config.sortForImport
      ? config.sortForImport(parsedRows, conflictResolution.resolutions)
      : parsedRows;

    // Transform to form rows
    const toCreate: TFormRow[] = [];
    const toUpdate: TFormRow[] = [];
    let skipped = 0;

    sortedRows.forEach((row) => {
      const formRow = config.transformToFormRow(
        row,
        conflictResolution.resolutions.get(row.slug),
        allEntities
      );

      if (!formRow) {
        skipped++;
        return;
      }

      if (formRow.id) {
        toUpdate.push(formRow);
      } else {
        toCreate.push(formRow);
      }
    });

    onImport(toCreate, toUpdate);

    setUploadStats({
      created: toCreate.length,
      updated: toUpdate.length,
      skipped,
    });

    setStep('success');
  };

  // Detect warnings (like orphans for categories)
  const warnings = config.detectWarnings
    ? config.detectWarnings(parsedRows, conflictResolution.resolutions, allEntities)
    : [];

  // Navigate to conflict with scroll
  const navigateToConflict = useCallback(
    (direction: 'next' | 'prev') => {
      conflictResolution.navigateToConflict(
        direction,
        pagination.currentPage,
        pagination.itemsPerPage,
        pagination.setCurrentPage,
        (rowIndex: number) => {
          const rowElement = document.querySelector(`[data-row-index="${rowIndex}"]`);
          if (rowElement) {
            rowElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      );
    },
    [conflictResolution, pagination]
  );

  // Keyboard navigation (n/p for conflicts)
  useEffect(() => {
    if (step !== 'preview') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/select/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        style={{
          maxWidth: step === 'preview' ? '1088px' : '800px',
          height: step === 'preview' ? '85vh' : 'auto',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {step === 'upload' && (
          <UploadStep
            config={config}
            importSource={fileUpload.importSource}
            onImportSourceChange={fileUpload.handleImportSourceChange}
            csvFile={fileUpload.csvFile}
            urlInput={fileUpload.urlInput}
            urlValidation={fileUpload.urlValidation}
            endpointInput={fileUpload.endpointInput}
            endpointValidation={fileUpload.endpointValidation}
            isDragging={fileUpload.isDragging}
            parseError={parseError}
            isLoading={isLoading}
            canContinue={fileUpload.canContinue}
            onContinue={handleParseCSV}
            fileHandlers={{
              handleFileSelect: fileUpload.handleFileSelect,
              handleDragOver: fileUpload.handleDragOver,
              handleDragLeave: fileUpload.handleDragLeave,
              handleDrop: fileUpload.handleDrop,
              handleRemoveFile: fileUpload.handleRemoveFile,
              handleUrlChange: fileUpload.handleUrlChange,
              handleEndpointChange: fileUpload.handleEndpointChange,
              triggerFileInput: fileUpload.triggerFileInput,
              fileInputRef: fileUpload.fileInputRef,
            }}
          />
        )}
        {step === 'preview' && (
          <PreviewStep
            config={config}
            parsedRows={parsedRows}
            parseStats={parseStats}
            resolutions={conflictResolution.resolutions}
            warnings={warnings}
            pagination={pagination}
            conflictHandlers={{
              handleResolutionChange: conflictResolution.handleResolutionChange,
              handleBulkResolution: conflictResolution.handleBulkResolution,
              defaultResolution: conflictResolution.defaultResolution,
            }}
            allEntities={allEntities}
            onBack={() => setStep('upload')}
            onImport={handleImport}
          />
        )}
        {step === 'success' && (
          <SuccessStep
            config={config}
            uploadStats={uploadStats}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
