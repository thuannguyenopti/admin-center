import { Select, SelectTrigger, SelectContent, Box } from '@optiaxiom/react';
import React, { useMemo } from 'react';
import { Input } from '@/app/components/Input';
import { CategoryFormRow as FormRowType, Category } from '../types';
import { generateSlug, buildParentOptions, getParentPath } from '../utils';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { getSelectValueInOptions } from '@/utils/selectValue';

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

  const visibilityOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
  ];

  // Normalize to plain { label, value } so Axiom/downshift never sees extra props (e.g. depth)
  // and ensure options is never empty so getItemProps always has a valid item
  const parentOptions = useMemo(() => {
    const raw = buildParentOptions(
      allCategories,
      formRow.id ? [formRow.id] : []
    );
    const normalized = raw.length > 0 ? raw : [{ label: 'None (Root level)', value: '' }];
    return normalized.map((o) => ({ label: o.label, value: o.value }));
  }, [allCategories, formRow.id]);

  const parentPath = formRow.parentId
    ? getParentPath(formRow.parentId, allCategories)
    : 'None (Root level)';

  const parentValue = getSelectValueInOptions(
    formRow.parentId ?? '',
    parentOptions,
    ''
  );
  const visibilityValue = getSelectValueInOptions(
    formRow.visibility,
    visibilityOptions,
    'public'
  );

  return (
    <Box display="flex" gap="10" alignItems="center">
      <Box flex="1" style={{ minWidth: 0 }}>
        <ShimmerFieldWrapper loading={loading}>
          <Input
            value={formRow.name}
            onChange={handleNameChange}
            placeholder="Category name"
            color="fg.default"
            border="1"
            borderColor="border.control"
            rounded="sm"
            style={{
              width: '100%',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
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
            color="fg.secondary"
            border="1"
            borderColor="border.control"
            rounded="sm"
            style={{
              width: '100%',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
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
              color="fg.default"
              border="1"
              borderColor="border.control"
              rounded="sm"
              style={{
                width: '100%',
                minWidth: 0,
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '-0.15px',
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
              color="fg.default"
              border="1"
              borderColor="border.control"
              rounded="sm"
              style={{
                width: '100%',
                minWidth: 0,
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '-0.15px',
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
            style={{ color: 'var(--ax-colors-fg-accent)', cursor: 'pointer' }}
            onClick={onDelete}
          />
        )}
        {showAdd && (
          <IconPlus
            size={13}
            style={{ color: 'var(--ax-colors-fg-accent)', cursor: 'pointer' }}
            onClick={onAdd}
          />
        )}
      </Box>
    </Box>
  );
}
