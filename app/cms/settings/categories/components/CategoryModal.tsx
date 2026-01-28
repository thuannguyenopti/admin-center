import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
} from '@optiaxiom/react';
import { Button } from '@/app/components/Button';
import { Text } from '@/app/components/Text';
import { CategoryFormRow as FormRowType, Category } from '../types';
import { CategoryFormRow } from './CategoryFormRow';
import { useState, useEffect, useCallback } from 'react';
import { generateSlug, isSlugUnique, isValidParent } from '../utils';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialCategories?: Category[];
  allCategories: Category[];
  onSave: (formRows: FormRowType[]) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  mode,
  initialCategories = [],
  allCategories,
  onSave,
}: CategoryModalProps) {
  const [formRows, setFormRows] = useState<FormRowType[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        setFormRows([
          { name: '', slug: '', parentId: null, visibility: 'public' },
        ]);
      } else if (mode === 'edit' && initialCategories.length > 0) {
        setFormRows(
          initialCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            visibility: cat.visibility,
          }))
        );
      }
      setErrors({});
    }
  }, [open, mode, initialCategories]);

  const handleChange = useCallback((
    index: number,
    field: keyof FormRowType,
    value: string | null
  ) => {
    setFormRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for this field
    setErrors((prev) => {
      if (prev[index]) {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      }
      return prev;
    });
  }, []);

  const handleSlugBlur = useCallback((index: number) => {
    const row = formRows[index];
    if (row.slug) {
      // Check uniqueness
      if (!isSlugUnique(row.slug, row.id, allCategories)) {
        setErrors((prev) => ({
          ...prev,
          [index]: 'Slug must be unique',
        }));
      }
    }
  }, [formRows, allCategories]);

  const handleAddRow = useCallback(() => {
    setFormRows((prev) => [
      ...prev,
      { name: '', slug: '', parentId: null, visibility: 'public' },
    ]);
  }, []);

  const handleDeleteRow = useCallback((index: number) => {
    setFormRows((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[index];
      // Reindex errors
      const reindexed: Record<number, string> = {};
      Object.keys(updated).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = updated[oldIndex];
        } else {
          reindexed[oldIndex] = updated[oldIndex];
        }
      });
      return reindexed;
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<number, string> = {};

    formRows.forEach((row, index) => {
      // Skip validation for empty rows in create mode
      if (mode === 'create' && !row.name && !row.slug) {
        return;
      }

      if (!row.name || row.name.length < 2) {
        newErrors[index] = 'Category name is required (min 2 characters)';
        return;
      }

      if (!row.slug) {
        newErrors[index] = 'Slug is required';
        return;
      }

      if (!isSlugUnique(row.slug, row.id, allCategories)) {
        newErrors[index] = 'Slug must be unique';
        return;
      }

      const parentValidation = isValidParent(row.id, row.parentId, allCategories);
      if (!parentValidation.valid) {
        newErrors[index] = parentValidation.error || 'Invalid parent selection';
        return;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    // Filter out empty rows in create mode
    const validRows =
      mode === 'create'
        ? formRows.filter((row) => row.name && row.slug)
        : formRows;

    if (validRows.length === 0) {
      return;
    }

    onSave(validRows);
    onOpenChange(false);
  };

  const title = mode === 'create' ? 'Create categories' : 'Edit categories';
  const buttonText = mode === 'create' ? 'Create' : 'Save';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        style={{
          maxWidth: '736px',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
        }}
      >
        <DialogHeader
          style={{
            fontSize: '22.99px',
            fontWeight: 300,
            letterSpacing: '-0.44px',
            color: '#080736',
          }}
        >
          {title}
        </DialogHeader>
        <DialogBody>
          <Box display="flex" flexDirection="column" gap="16">
            {/* Subtitle */}
            <Text
              style={{
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '-0.15px',
                color: '#080736',
              }}
            >
              Define categories to organise your content.
            </Text>

            {/* Header Row */}
            <Box display="flex" flexDirection="column" gap="2">
              <Box display="flex" gap="10" mb="8">
                <Box
                  flex="1"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                    minWidth: 0,
                  }}
                >
                  Category
                </Box>
                <Box
                  flex="1"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                    minWidth: 0,
                  }}
                >
                  Slug
                </Box>
                <Box
                  flex="1"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                    minWidth: 0,
                  }}
                >
                  Category parent
                </Box>
                <Box
                  flex="1"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                    minWidth: 0,
                  }}
                >
                  Visibility
                </Box>
                {/* Spacer for icon column */}
                <Box style={{ width: '30px', flexShrink: 0 }} />
              </Box>

              {/* Form Rows */}
              {formRows.map((row, index) => (
                <Box key={index} display="flex" flexDirection="column" gap="4">
                  <CategoryFormRow
                    formRow={row}
                    index={index}
                    allCategories={allCategories}
                    onChange={handleChange}
                    onSlugBlur={handleSlugBlur}
                    onDelete={() => handleDeleteRow(index)}
                    onAdd={handleAddRow}
                    showDelete={formRows.length > 1}
                    showAdd={mode === 'create' && index === formRows.length - 1}
                  />
                  {errors[index] && (
                    <Box
                      style={{
                        color: '#dc2626',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    >
                      {errors[index]}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter style={{ gap: '16px' }}>
          <DialogClose size="lg">Cancel</DialogClose>
          <Button
            appearance="primary"
            size="lg"
            onClick={handleSave}
            style={{
              backgroundColor: '#0037ff',
              color: '#ffffff',
            }}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
