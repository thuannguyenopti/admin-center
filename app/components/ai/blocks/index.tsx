"use client";

import { registerAdaptiveBlock } from '../AdaptiveBlockRegistry';
import { TableBlock } from './TableBlock';
import { PreflightResultsBlock } from './PreflightResultsBlock';
import { PreflightProgressBlock } from './PreflightProgressBlock';

/**
 * Register all available adaptive block types
 * This file should be imported once at app initialization
 */
export function registerAllAdaptiveBlocks(): void {
  registerAdaptiveBlock('table', TableBlock);
  registerAdaptiveBlock('preflight-results', PreflightResultsBlock);
  registerAdaptiveBlock('preflight-progress', PreflightProgressBlock);
}

// Auto-register blocks when this module is imported
registerAllAdaptiveBlocks();

// Re-export blocks for direct usage if needed
export { TableBlock } from './TableBlock';
export { PreflightResultsBlock } from './PreflightResultsBlock';
export { PreflightProgressBlock } from './PreflightProgressBlock';
