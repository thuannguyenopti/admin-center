import { useState } from 'react';
import { ImportStep, UploadStats } from '../components/ImportModal/types';

/**
 * Hook for managing import workflow state (steps, loading, errors)
 */
export function useImportWorkflow() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    created: 0,
    updated: 0,
    skipped: 0,
  });

  const resetWorkflow = () => {
    setStep('upload');
    setIsLoading(false);
    setParseError(null);
    setUploadStats({ created: 0, updated: 0, skipped: 0 });
  };

  return {
    step,
    setStep,
    isLoading,
    setIsLoading,
    parseError,
    setParseError,
    uploadStats,
    setUploadStats,
    resetWorkflow,
  };
}
