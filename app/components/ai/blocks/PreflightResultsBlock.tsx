"use client";

import React from 'react';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';
import { PreflightResultsTable } from '../PreflightResultsTable';
import type { PreflightAuditResult } from '../PreflightAuditTypes';

export type PreflightResultsBlockMetadata = {
  blockType: 'preflight-results';
  auditResult: PreflightAuditResult;
};

/**
 * PreflightResultsBlock - Adaptive block wrapper for preflight results
 *
 * Integrates the existing PreflightResultsTable component into the
 * adaptive block system for consistent rendering in chat.
 */
export const PreflightResultsBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
  messageId,
}) => {
  const preflightMetadata = metadata as PreflightResultsBlockMetadata;

  return (
    <PreflightResultsTable
      result={preflightMetadata.auditResult}
      messageId={messageId}
    />
  );
};
