<<<<<<< HEAD
"use client";

import React from 'react';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';
import { PageGenerationProgress, ChecklistItem } from '../PageGenerationProgress';

export type PageGenerationProgressBlockMetadata = {
  blockType: 'page-generation-progress';
  checklist?: ChecklistItem[];
  loading?: boolean;
  loadingMessage?: string;
  contextualMessage?: string;
  pageType?: string;
  sections?: string[];
  isCompleted?: boolean;
};

/**
 * PageGenerationProgressBlock - Adaptive block for page generation progress
 *
 * Displays real-time progress of AI-powered page generation with friendly messaging
 * and collapsible technical details.
 */
export const PageGenerationProgressBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const progressMetadata = metadata as PageGenerationProgressBlockMetadata;

  if (!progressMetadata.checklist) {
    return null;
  }

  return (
    <PageGenerationProgress
      checklist={progressMetadata.checklist}
      contextualMessage={progressMetadata.contextualMessage}
      pageType={progressMetadata.pageType}
      sections={progressMetadata.sections}
      isCompleted={progressMetadata.isCompleted}
    />
  );
};
=======
"use client";

import React from 'react';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';
import { PageGenerationProgress, ChecklistItem } from '../PageGenerationProgress';

export type PageGenerationProgressBlockMetadata = {
  blockType: 'page-generation-progress';
  checklist?: ChecklistItem[];
  loading?: boolean;
  loadingMessage?: string;
  contextualMessage?: string;
  pageType?: string;
  sections?: string[];
  isCompleted?: boolean;
};

/**
 * PageGenerationProgressBlock - Adaptive block for page generation progress
 *
 * Displays real-time progress of AI-powered page generation with friendly messaging
 * and collapsible technical details.
 */
export const PageGenerationProgressBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const progressMetadata = metadata as PageGenerationProgressBlockMetadata;

  if (!progressMetadata.checklist) {
    return null;
  }

  return (
    <PageGenerationProgress
      checklist={progressMetadata.checklist}
      contextualMessage={progressMetadata.contextualMessage}
      pageType={progressMetadata.pageType}
      sections={progressMetadata.sections}
      isCompleted={progressMetadata.isCompleted}
    />
  );
};
>>>>>>> origin/main
