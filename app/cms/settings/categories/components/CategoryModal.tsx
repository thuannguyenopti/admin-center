import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
  Button,
  Tooltip,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { CategoryFormRow as FormRowType, Category } from '../types';
import { CategoryFormRow } from './CategoryFormRow';
import { useState, useEffect, useCallback } from 'react';
import { generateSlug, isSlugUnique, isValidParent } from '../utils';
import { IconSparkles, IconCircleInfo } from '@optimizely/axiom-icons';

export interface ContentContextItem {
  name: string;
  baseType?: string;
  categorySlugs: string[];
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialCategories?: Category[];
  allCategories: Category[];
  /** Content (e.g. pages) to infer categories from: name, type, and current category slugs. */
  contentContext?: ContentContextItem[];
  onSave: (formRows: FormRowType[]) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  mode,
  initialCategories = [],
  allCategories,
  contentContext = [],
  onSave,
}: CategoryModalProps) {
  const [formRows, setFormRows] = useState<FormRowType[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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
      setGenerateError(null);
    }
  }, [open, mode, initialCategories]);

  // Lock page scroll when modal is open so only the modal body scrolls (single scrollbar)
  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
      return () => {
        delete document.body.dataset.modalOpen;
      };
    }
  }, [open]);

  const toCategoryName = (str: string): string =>
    str
      .trim()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();

  const handleGenerate = useCallback(async () => {
    const hasTaxonomy = allCategories.length > 0;
    const hasContent = contentContext.length > 0;
    if (!hasTaxonomy && !hasContent) return;
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const categoryTaxonomy = allCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
      }));
      const res = await fetch('/api/categories/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryTaxonomy,
          contentContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || 'Generate is not available');
        return;
      }
      const suggested: Array<{ name: string; slug: string; parentSlug: string | null }> =
        data.suggestedCategories ?? [];
      if (suggested.length > 0) {
        const existingSlugs = new Set(allCategories.map((c) => c.slug));
        const usedSlugs = new Set<string>(existingSlugs);
        const slugToId = new Map(allCategories.map((c) => [c.slug, c.id]));

        const rows: FormRowType[] = suggested.map((item) => {
          let slug = item.slug || generateSlug(item.name);
          if (usedSlugs.has(slug)) {
            let suffix = 2;
            while (usedSlugs.has(`${slug}-${suffix}`)) suffix++;
            slug = `${slug}-${suffix}`;
          }
          usedSlugs.add(slug);
          const parentId = item.parentSlug ? slugToId.get(item.parentSlug) ?? null : null;
          return {
            name: toCategoryName(item.name),
            slug,
            parentId,
            visibility: 'public' as const,
          };
        });
        setFormRows(rows);
        setErrors({});
      } else {
        setGenerateError('No suggestions generated');
      }
    } catch {
      setGenerateError('Generate is not available');
    } finally {
      setGenerateLoading(false);
    }
  }, [allCategories, contentContext]);

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

  const canSubmitCreate =
    mode !== 'create' ||
    formRows.some(
      (row) => row.name.trim().length >= 2 && row.slug.trim().length > 0
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        style={{
          maxWidth: '736px',
          maxHeight: '80vh',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DialogHeader
          description="Define categories to organise your content."
          fontSize="xl"
          fontWeight="400"
          color="fg.default"
        >
          {title}
        </DialogHeader>
        <DialogBody
          pt="0"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Box display="flex" flexDirection="column" gap="8">
            {/* Column headers + form rows */}
            <Box display="flex" flexDirection="column" gap="2">
              <Box display="flex" gap="10" mb="4">
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  Category
                </Box>
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  Slug
                </Box>
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  Category parent
                </Box>
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  <Box display="inline-flex" alignItems="center" gap="4">
                    <span>Visibility</span>
                    <Tooltip
                      aria-label="Visibility help"
                      content={
                        <Box display="flex" flexDirection="column" gap="8" fontSize="sm" style={{ maxWidth: 280 }}>
                          <Box as="p" m="0">
                            Public categories appear in filters and APIs. Private categories are visible only in the CMS.
                          </Box>
                          <Box as="p" m="0" fontWeight="600">
                            Examples:
                          </Box>
                          <Box as="p" m="0">
                            Public: site navigation, product taxonomy.
                          </Box>
                          <Box as="p" m="0">
                            Private: internal workflow, draft groupings.
                          </Box>
                        </Box>
                      }
                      delayDuration={300}
                    >
                      <span style={{ display: 'inline-flex', cursor: 'help' }}>
                        <IconCircleInfo size={14} color="var(--ax-colors-fg-secondary)" />
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                {/* Spacer for icon column */}
                <Box style={{ width: '30px', flexShrink: 0 }} />
              </Box>

              {/* Form Rows: shimmer only on input fields, one row per visible row */}
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
                    loading={mode === 'create' && generateLoading}
                  />
                  {errors[index] && (
                    <Box color="fg.error" fontSize="xs" mt="2">
                      {errors[index]}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
            {mode === 'create' && (
              <Box display="flex" justifyContent="flex-start" alignItems="center">
                <Button
                  appearance="default-opal"
                  size="sm"
                  rounded="sm"
                  px="8"
                  className="opalGenerateButton"
                  icon={<IconSparkles size={16} />}
                  iconPosition="start"
                  onClick={handleGenerate}
                  disabled={generateLoading || (allCategories.length === 0 && contentContext.length === 0)}
                  loading={generateLoading}
                  aria-label="Generate category suggestions with Opal"
                >
                  Generate
                </Button>
              </Box>
            )}
            {mode === 'create' && generateError && (
              <Box>
                <Text fontSize="xs" color="fg.error">
                  {generateError}
                </Text>
              </Box>
            )}
          </Box>
        </DialogBody>
        <DialogFooter style={{ gap: '16px' }}>
          <DialogClose size="lg">Cancel</DialogClose>
          <Button
            appearance="primary"
            size="lg"
            onClick={handleSave}
            disabled={mode === 'create' && !canSubmitCreate}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
