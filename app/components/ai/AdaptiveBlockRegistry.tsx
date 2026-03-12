import React from 'react';

/**
 * Base type for all adaptive block metadata
 */
export type AdaptiveBlockMetadata = {
  blockType: string;
  [key: string]: any;
};

/**
 * Props for adaptive block components
 */
export type AdaptiveBlockComponentProps = {
  metadata: AdaptiveBlockMetadata;
  messageId: string;
  onDismiss?: () => void;
};

/**
 * Registry of adaptive block types
 * Each block type maps to a React component that renders the block
 */
type BlockRegistry = {
  [blockType: string]: React.FC<AdaptiveBlockComponentProps>;
};

const blockRegistry: BlockRegistry = {};

/**
 * Register a new adaptive block type
 */
export function registerAdaptiveBlock(
  blockType: string,
  component: React.FC<AdaptiveBlockComponentProps>
): void {
  blockRegistry[blockType] = component;
}

/**
 * Get the component for a given block type
 */
export function getAdaptiveBlockComponent(
  blockType: string
): React.FC<AdaptiveBlockComponentProps> | undefined {
  return blockRegistry[blockType];
}

/**
 * Check if a block type is registered
 */
export function isBlockTypeRegistered(blockType: string): boolean {
  return blockType in blockRegistry;
}

/**
 * Get all registered block types
 */
export function getRegisteredBlockTypes(): string[] {
  return Object.keys(blockRegistry);
}
