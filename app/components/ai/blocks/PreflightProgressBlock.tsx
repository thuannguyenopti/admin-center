"use client";

import React from 'react';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';
import { PreflightProgressIndicator } from '../PreflightProgressIndicator';

export type ChecklistItem = {
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
};

export type PreflightProgressBlockMetadata = {
  blockType: 'preflight-progress';
  checklist: ChecklistItem[];
};

/**
 * PreflightProgressBlock - Adaptive block wrapper for preflight progress
 *
 * Integrates the existing PreflightProgressIndicator component into the
 * adaptive block system for consistent rendering in chat.
 */
export const PreflightProgressBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const progressMetadata = metadata as PreflightProgressBlockMetadata;

  return (
    <PreflightProgressIndicator checklist={progressMetadata.checklist} />
  );
};
