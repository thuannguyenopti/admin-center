# Adaptive Blocks System

The Adaptive Blocks system provides a flexible, extensible way to render rich, interactive content within Opal Chat. It replaces hardcoded message type checks with a registry-based pattern that makes it easy to add new block types.

## Architecture

### Core Components

1. **AdaptiveBlock** - The base wrapper component that provides consistent styling, actions, and structure
2. **AdaptiveBlockRegistry** - Manages the registration and lookup of block types
3. **Block Components** - Specialized components for different content types (tables, forms, cards, etc.)

### File Structure

```
app/components/ai/
├── AdaptiveBlock.tsx              # Base wrapper component
├── AdaptiveBlockRegistry.tsx      # Registry system
├── blocks/
│   ├── index.tsx                  # Auto-registers all blocks
│   ├── TableBlock.tsx            # Generic table block
│   ├── PreflightResultsBlock.tsx # Preflight results adapter
│   └── PreflightProgressBlock.tsx # Preflight progress adapter
```

## Creating a New Adaptive Block

### Step 1: Define Your Metadata Type

```typescript
export type MyBlockMetadata = {
  blockType: 'my-block';
  // Your custom properties
  title: string;
  data: any[];
};
```

### Step 2: Create the Block Component

```typescript
// app/components/ai/blocks/MyBlock.tsx
"use client";

import React from 'react';
import { AdaptiveBlock } from '../AdaptiveBlock';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';

export const MyBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
  messageId,
}) => {
  const myMetadata = metadata as MyBlockMetadata;

  const actions = [
    {
      label: 'Primary Action',
      onClick: () => console.log('Clicked!'),
      appearance: 'primary' as const,
    },
  ];

  return (
    <AdaptiveBlock
      title={myMetadata.title}
      actions={actions}
      scrollable={true}
    >
      {/* Your custom content here */}
      <div>Your content goes here</div>
    </AdaptiveBlock>
  );
};
```

### Step 3: Register the Block

```typescript
// In app/components/ai/blocks/index.tsx
import { MyBlock } from './MyBlock';

export function registerAllAdaptiveBlocks(): void {
  // ... existing registrations
  registerAdaptiveBlock('my-block', MyBlock);
}

export { MyBlock } from './MyBlock';
```

### Step 4: Use in Chat

```typescript
// Add a message with your block type
opalPanelControls.addMessage({
  role: 'assistant',
  content: 'Here are your results:',
  messageType: 'my-block',
  metadata: {
    title: 'My Custom Block',
    data: [/* ... */],
  },
});
```

## AdaptiveBlock Props

The base `AdaptiveBlock` component accepts the following props:

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Optional title shown in the header |
| `children` | `ReactNode` | The main content of the block |
| `actions` | `AdaptiveBlockAction[]` | Array of action buttons shown in footer |
| `imagery` | `ReactNode` | Optional imagery/media shown between header and content |
| `maxHeight` | `string` | Maximum height (e.g., "500px") |
| `scrollable` | `boolean` | Whether content should scroll if it exceeds maxHeight |

### Action Button Type

```typescript
type AdaptiveBlockAction = {
  label: string;
  onClick: () => void;
  appearance?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
};
```

## Example: Simple Data Table Block

```typescript
import { AdaptiveBlock } from '../AdaptiveBlock';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';

export type DataTableMetadata = {
  blockType: 'data-table';
  columns: string[];
  rows: string[][];
};

export const DataTableBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const { columns, rows } = metadata as DataTableMetadata;

  return (
    <AdaptiveBlock title="Data Results" scrollable maxHeight="400px">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </AdaptiveBlock>
  );
};
```

## Example: Form Block

```typescript
export const FormBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
  messageId,
  onDismiss,
}) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = () => {
    // Process form data
    console.log('Form submitted:', formData);
    onDismiss?.();
  };

  const actions = [
    {
      label: 'Submit',
      onClick: handleSubmit,
      appearance: 'primary' as const,
    },
    {
      label: 'Cancel',
      onClick: onDismiss || (() => {}),
      appearance: 'secondary' as const,
    },
  ];

  return (
    <AdaptiveBlock title="User Input Required" actions={actions}>
      {/* Form fields */}
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    </AdaptiveBlock>
  );
};
```

## Benefits of the Adaptive Block System

1. **Consistency** - All interactive islands share the same visual structure and behavior
2. **Extensibility** - New block types can be added without modifying OpalMessage
3. **Reusability** - The AdaptiveBlock wrapper handles common UI patterns (headers, actions, scrolling)
4. **Type Safety** - Each block type has its own strongly-typed metadata
5. **Maintainability** - Block logic is isolated in dedicated components

## Migration from Hardcoded Message Types

Before:
```typescript
// In OpalMessage.tsx
message.messageType === 'my-type' ? (
  <MySpecialComponent data={message.metadata} />
) : ...
```

After:
```typescript
// Just register the block
registerAdaptiveBlock('my-type', MySpecialComponent);

// OpalMessage automatically handles it via the registry
```

## Best Practices

1. **Use AdaptiveBlock for structure** - Let AdaptiveBlock handle headers, footers, and scrolling
2. **Focus block components on content** - Your block component should focus on rendering the unique content
3. **Provide clear metadata types** - Define TypeScript types for your metadata
4. **Handle dismissal gracefully** - Use the `onDismiss` callback when appropriate
5. **Keep blocks self-contained** - Blocks should manage their own state and interactions
6. **Use Axiom components** - Stay consistent with the design system

## Future Enhancements

Potential additions to the adaptive block system:

- **CardBlock** - For promotional or feature highlight content
- **MediaBlock** - For images, videos, and rich media
- **ChartBlock** - For data visualizations
- **SuggestionBlock** - For AI-powered suggestions with accept/reject actions
- **ComparisonBlock** - For side-by-side comparisons
- **TimelineBlock** - For sequential events or history
