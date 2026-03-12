import React from 'react';
import { Box, Heading, Button, Group } from '@optiaxiom/react';

export type AdaptiveBlockAction = {
  label: string;
  onClick: () => void;
  appearance?: 'default' | 'danger' | 'primary' | 'subtle' | 'danger-outline' | 'default-opal' | 'inverse' | 'primary-opal';
  disabled?: boolean;
};

export type AdaptiveBlockProps = {
  title?: string;
  children: React.ReactNode;
  actions?: AdaptiveBlockAction[];
  imagery?: React.ReactNode;
  maxHeight?: string;
  scrollable?: boolean;
};

/**
 * AdaptiveBlock - A versatile container component for chat interactions
 *
 * Provides a card-like shell that can contain text, imagery, tables, forms,
 * and interactive elements. Follows the Axiom design system patterns.
 */
export const AdaptiveBlock: React.FC<AdaptiveBlockProps> = ({
  title,
  children,
  actions,
  imagery,
  maxHeight,
  scrollable = false,
}) => {
  return (
    <Box
      bg="bg.default"
      border="1"
      borderColor="border.default"
      rounded="md"
      overflow="hidden"
      shadow="sm"
    >
      {/* Header Section */}
      {title && (
        <Box p="16">
          <Heading level="4" fontSize="md">
            {title}
          </Heading>
        </Box>
      )}

      {/* Key Imagery Section (if provided) */}
      {imagery && (
        <Box>
          {imagery}
        </Box>
      )}

      {/* Content Slot */}
      <Box
        p="16"
        overflow={scrollable ? 'auto' : undefined}
        style={scrollable ? { maxHeight: maxHeight || '400px' } : undefined}
      >
        {children}
      </Box>

      {/* Actions Section */}
      {actions && actions.length > 0 && (
        <Box p="16">
          <Group gap="8" justifyContent="flex-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                appearance={action.appearance || 'default'}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </Group>
        </Box>
      )}
    </Box>
  );
};
