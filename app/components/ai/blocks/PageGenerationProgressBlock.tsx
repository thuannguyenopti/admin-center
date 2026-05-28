"use client";

import React from 'react';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';
import { PreflightProgressIndicator } from '../PreflightProgressIndicator';

export type ChecklistItem = {
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
};

export type PageGenerationProgressBlockMetadata = {
  blockType: 'page-generation-progress';
  checklist?: ChecklistItem[];
  loading?: boolean;
  loadingMessage?: string;
};

/**
 * PageGenerationProgressBlock - Adaptive block for page generation progress
 *
 * Displays real-time progress of AI-powered page generation with task checklist.
 * Reuses the PreflightProgressIndicator component for consistent UI.
 */
export const PageGenerationProgressBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const progressMetadata = metadata as PageGenerationProgressBlockMetadata;

  if (!progressMetadata.checklist) {
    return null;
  }

  return (
    <PreflightProgressIndicator checklist={progressMetadata.checklist} />
  );
};
