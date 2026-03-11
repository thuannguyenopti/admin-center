import { useState, useRef, useCallback } from 'react';
import { ImportSource, ValidationState } from '../components/ImportModal/types';
import { validateUrl, validateCsvFile } from '../utils/validation';

/**
 * Hook for managing file upload state and handlers
 */
export function useFileUpload(onError?: (error: string) => void) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('');
  const [urlValidation, setUrlValidation] = useState<ValidationState>('idle');
  const [endpointValidation, setEndpointValidation] = useState<ValidationState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [importSource, setImportSource] = useState<ImportSource>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and set file
  const handleFileValidation = useCallback((file: File) => {
    onError?.(null as any); // Clear previous errors

    const validation = validateCsvFile(file);
    if (!validation.valid) {
      onError?.(validation.error!);
      return;
    }

    setCsvFile(file);
  }, [onError]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  }, [handleFileValidation]);

  // Handle file select from input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileValidation(files[0]);
    }
  }, [handleFileValidation]);

  // Remove file
  const handleRemoveFile = useCallback(() => {
    setCsvFile(null);
    onError?.(null as any);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onError]);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle URL input change
  const handleUrlChange = useCallback((value: string) => {
    setUrlInput(value);
    onError?.(null as any); // Clear any previous errors

    if (!value.trim()) {
      setUrlValidation('idle');
    } else if (validateUrl(value)) {
      setUrlValidation('valid');
    } else {
      setUrlValidation('invalid');
    }
  }, [onError]);

  // Handle endpoint input change
  const handleEndpointChange = useCallback((value: string) => {
    setEndpointInput(value);
    onError?.(null as any); // Clear any previous errors

    if (!value.trim()) {
      setEndpointValidation('idle');
    } else if (validateUrl(value)) {
      setEndpointValidation('valid');
    } else {
      setEndpointValidation('invalid');
    }
  }, [onError]);

  // Handle import source change
  const handleImportSourceChange = useCallback((value: ImportSource) => {
    setImportSource(value);
    onError?.(null as any); // Clear any previous errors
  }, [onError]);

  // Check if can continue (has valid input for current source)
  const canContinue = !!(
    (importSource === 'csv' && csvFile) ||
    (importSource === 'url' && urlInput.trim() && urlValidation === 'valid') ||
    (importSource === 'endpoint' && endpointInput.trim() && endpointValidation === 'valid')
  );

  // Reset state
  const resetFileUpload = useCallback(() => {
    setCsvFile(null);
    setUrlInput('');
    setEndpointInput('');
    setUrlValidation('idle');
    setEndpointValidation('idle');
    setIsDragging(false);
    setImportSource('csv');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    // State
    csvFile,
    urlInput,
    endpointInput,
    urlValidation,
    endpointValidation,
    isDragging,
    importSource,
    fileInputRef,
    canContinue,

    // Setters
    setCsvFile,
    setUrlInput,
    setEndpointInput,
    setUrlValidation,
    setEndpointValidation,
    setImportSource,

    // Handlers
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleUrlChange,
    handleEndpointChange,
    handleImportSourceChange,
    triggerFileInput,
    resetFileUpload,
  };
}
