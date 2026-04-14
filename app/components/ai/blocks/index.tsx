"use client";

import { registerAdaptiveBlock } from '../AdaptiveBlockRegistry';
import { TableBlock } from './TableBlock';
import { PreflightResultsBlock } from './PreflightResultsBlock';
import { PreflightProgressBlock } from './PreflightProgressBlock';
import { PageGenerationProgressBlock } from './PageGenerationProgressBlock';
import { AgentQuestionSurveyBlock } from './AgentQuestionSurveyBlock';
import { AgentDisplayCardBlock } from './AgentDisplayCardBlock';
import { AgentInteractiveCardBlock } from './AgentInteractiveCardBlock';

/**
 * Register all available adaptive block types
 * This file should be imported once at app initialization
 */
export function registerAllAdaptiveBlocks(): void {
  registerAdaptiveBlock('table', TableBlock);
  registerAdaptiveBlock('preflight-results', PreflightResultsBlock);
  registerAdaptiveBlock('preflight-progress', PreflightProgressBlock);
  registerAdaptiveBlock('page-generation-progress', PageGenerationProgressBlock);
  registerAdaptiveBlock('agent-question-survey', AgentQuestionSurveyBlock);
  registerAdaptiveBlock('agent-display-card', AgentDisplayCardBlock);
  registerAdaptiveBlock('agent-interactive-card', AgentInteractiveCardBlock);
}

// Auto-register blocks when this module is imported
registerAllAdaptiveBlocks();

// Re-export blocks for direct usage if needed
export { TableBlock } from './TableBlock';
export { PreflightResultsBlock } from './PreflightResultsBlock';
export { PreflightProgressBlock } from './PreflightProgressBlock';
export { PageGenerationProgressBlock } from './PageGenerationProgressBlock';
export { AgentQuestionSurveyBlock } from './AgentQuestionSurveyBlock';
export { AgentDisplayCardBlock } from './AgentDisplayCardBlock';
export { AgentInteractiveCardBlock } from './AgentInteractiveCardBlock';
