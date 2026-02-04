import { Select, SelectTrigger, SelectContent, Box } from '@optiaxiom/react';
import React from 'react';
import { Input } from '@/app/components/Input';
import { CategoryFormRow as FormRowType, Category } from '../types';
import { generateSlug, buildParentOptions, getParentPath } from '../utils';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const SHIMMER_INSET = 2;

function ShimmerFieldWrapper({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  if (!loading) return <>{children}</>;
  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      {children}
      <Box
        className="opal-skeleton-shimmer"
        style={{
          position: 'absolute',
          top: SHIMMER_INSET,
          left: SHIMMER_INSET,
          right: SHIMMER_INSET,
          bottom: SHIMMER_INSET,
          pointerEvents: 'none',
          borderRadius: '2px',
        }}
      />
    </Box>
  );
}

interface CategoryFormRowProps {
  formRow: FormRowType;
  index: number;
  allCategories: Category[];
  onChange: (index: number, field: keyof FormRowType, value: string | null) => void;
  onSlugBlur: (index: number) => void;
  onDelete: () => void;
  onAdd: () => void;
  showDelete: boolean;
  showAdd: boolean;
  loading?: boolean;
}

export function CategoryFormRow({
  formRow,
  index,
  allCategories,
  onChange,
  onSlugBlur,
  onDelete,
  onAdd,
  showDelete,
  showAdd,
  loading = false,
}: CategoryFormRowProps) {
  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onChange(index, 'name', newName);
    onChange(index, 'slug', generateSlug(newName));
  };

  // Handle slug change with "/" prefix
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove leading "/" if present for storage
    if (value.startsWith('/')) {
      value = value.substring(1);
    }
    onChange(index, 'slug', value);
  };

  // Display slug with "/" prefix
  const displaySlug = formRow.slug ? `/${formRow.slug}` : '';

  const parentOptions = buildParentOptions(
    allCategories,
    formRow.id ? [formRow.id] : []
  );

  const parentPath = formRow.parentId
    ? getParentPath(formRow.parentId, allCategories)
    : 'None (Root level)';

  // Ensure value is in options so downshift getItemProps receives a valid item
  const parentValue = parentOptions.some(
    (o) => o.value === (formRow.parentId || '')
  )
    ? formRow.parentId || ''
    : '';

  const visibilityOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
  ];
  const visibilityValue = visibilityOptions.some(
    (o) => o.value === formRow.visibility
  )
    ? formRow.visibility
    : 'public';

  return (
    <Box display="flex" gap="10" alignItems="center">
      <Box flex="1" style={{ minWidth: 0 }}>
        <ShimmerFieldWrapper loading={loading}>
          <Input
            value={formRow.name}
            onChange={handleNameChange}
            placeholder="Category name"
            style={{
              width: '100%',
              border: '1px solid #9e9e9e',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              color: '#080736',
            }}
          />
        </ShimmerFieldWrapper>
      </Box>
      <Box flex="1" style={{ minWidth: 0 }}>
        <ShimmerFieldWrapper loading={loading}>
          <Input
            value={displaySlug}
            onChange={handleSlugChange}
            onBlur={() => onSlugBlur(index)}
            placeholder="/slug"
            style={{
              width: '100%',
              border: '1px solid #9e9e9e',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              color: '#707070',
              fontFamily: 'Hack, monospace',
            }}
          />
        </ShimmerFieldWrapper>
      </Box>
      <Box flex="1" style={{ minWidth: 0 }}>
        <ShimmerFieldWrapper loading={loading}>
          <Select
            value={parentValue}
            onValueChange={(value) =>
              onChange(index, 'parentId', value === '' ? null : value)
            }
            options={parentOptions}
          >
            <SelectTrigger
              size="lg"
              style={{
                width: '100%',
                minWidth: 0,
                border: '1px solid #9e9e9e',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '-0.15px',
                color: '#080736',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {parentValue === '' ? 'None (Root level)' : parentPath}
              </span>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </ShimmerFieldWrapper>
      </Box>
      <Box flex="1" style={{ minWidth: 0 }}>
        <ShimmerFieldWrapper loading={loading}>
          <Select
            value={visibilityValue}
            onValueChange={(value) =>
              onChange(index, 'visibility', value as 'public' | 'private')
            }
            options={visibilityOptions}
          >
            <SelectTrigger
              size="lg"
              style={{
                width: '100%',
                minWidth: 0,
                border: '1px solid #9e9e9e',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '-0.15px',
                color: '#080736',
              }}
            >
              {visibilityValue.charAt(0).toUpperCase() + visibilityValue.slice(1)}
            </SelectTrigger>
            <SelectContent />
          </Select>
        </ShimmerFieldWrapper>
      </Box>
      {/* Icon column */}
      <Box display="flex" alignItems="center" gap="4" style={{ width: '30px', flexShrink: 0 }}>
        {showDelete && (
          <IconTrash
            size={14}
            style={{ color: '#0037ff', cursor: 'pointer' }}
            onClick={onDelete}
          />
        )}
        {showAdd && (
          <IconPlus
            size={13}
            style={{ color: '#0037ff', cursor: 'pointer' }}
            onClick={onAdd}
          />
        )}
      </Box>
    </Box>
  );
}
