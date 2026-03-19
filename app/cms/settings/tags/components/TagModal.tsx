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
import { TagFormRow as FormRowType, Tag } from '../types';
import { TagFormRow } from './TagFormRow';
import { useState, useEffect, useCallback } from 'react';
import { generateSlug, isSlugUnique } from '../utils';
import { IconSparkles, IconCircleInfo } from '@optimizely/axiom-icons';

export interface ContentContextItem {
  name: string;
  baseType?: string;
  tagSlugs: string[];
}

interface TagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialTags?: Tag[];
  allTags: Tag[];
  /** Content (e.g. pages) to infer tags from: name, type, and current tag slugs. */
  contentContext?: ContentContextItem[];
  onSave: (formRows: FormRowType[]) => void;
}

export function TagModal({
  open,
  onOpenChange,
  mode,
  initialTags = [],
  allTags,
  contentContext = [],
  onSave,
}: TagModalProps) {
  const [formRows, setFormRows] = useState<FormRowType[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        setFormRows([
          { name: '', slug: '', visibility: 'public' },
        ]);
      } else if (mode === 'edit' && initialTags.length > 0) {
        setFormRows(
          initialTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            visibility: tag.visibility,
          }))
        );
      }
      setErrors({});
      setGenerateError(null);
    }
  }, [open, mode, initialTags]);

  // Lock page scroll when modal is open so only the modal body scrolls (single scrollbar)
  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
      return () => {
        delete document.body.dataset.modalOpen;
      };
    }
  }, [open]);

  const toTagName = (str: string): string =>
    str
      .trim()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();

  const handleGenerate = useCallback(async () => {
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const payload: any = {
        itemName: allTags.length > 0
          ? 'Suggest new tag names that fit the existing taxonomy'
          : contentContext.length > 0
            ? 'Suggest tag names based on the content items listed'
            : 'Suggest useful tag names for a content management system',
      };
      if (allTags.length > 0) {
        payload.tagTaxonomy = allTags.map((t) => ({ name: t.name, slug: t.slug }));
      }
      if (contentContext.length > 0) {
        payload.contentContext = contentContext;
      }
      const res = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || 'Generate is not available');
        return;
      }
      const existingSlugs: string[] = data.suggestedSlugs ?? [];
      const newNames: string[] = data.suggestedNewNames ?? [];
      const namesToUse = newNames.length > 0 ? newNames : existingSlugs;
      if (namesToUse.length > 0) {
        const rows: FormRowType[] = namesToUse.map((nameOrSlug) => {
          const name = toTagName(nameOrSlug);
          return {
            name,
            slug: generateSlug(name),
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
  }, [allTags, contentContext]);

  const handleChange = useCallback(
    (index: number, field: keyof FormRowType, value: string) => {
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
    },
    []
  );

  const handleSlugBlur = useCallback(
    (index: number) => {
      const row = formRows[index];
      if (row.slug) {
        // Check uniqueness
        if (!isSlugUnique(row.slug, row.id, allTags)) {
          setErrors((prev) => ({
            ...prev,
            [index]: 'Slug must be unique',
          }));
        }
      }
    },
    [formRows, allTags]
  );

  const handleAddRow = useCallback(() => {
    setFormRows((prev) => [
      ...prev,
      { name: '', slug: '', visibility: 'public' },
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
        newErrors[index] = 'Tag name is required (min 2 characters)';
        return;
      }

      if (!row.slug) {
        newErrors[index] = 'Slug is required';
        return;
      }

      if (!isSlugUnique(row.slug, row.id, allTags)) {
        newErrors[index] = 'Slug must be unique';
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

  const title = mode === 'create' ? 'Create tags' : 'Edit tags';
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
          description="Add and manage tags to label and filter your content."
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
            {mode === 'create' && generateError && (
              <Text fontSize="xs" color="fg.error">
                {generateError}
              </Text>
            )}
            {/* Column headers + form rows */}
            <Box display="flex" flexDirection="column" gap="2">
              <Box display="flex" gap="10" mb="4">
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  Tags
                </Box>
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  Slug
                </Box>
                <Box flex="1" fontSize="sm" fontWeight="400" color="fg.default" style={{ minWidth: 0 }}>
                  <Box display="inline-flex" alignItems="center" gap="4">
                    <span>Visibility</span>
                    <Tooltip
                      aria-label="Visibility help"
                      content={
                        <Box display="flex" flexDirection="column" gap="8" fontSize="sm" style={{ maxWidth: 280 }}>
                          <Text m="0">
                            Public tags appear in filters and APIs. Private tags are visible only in the CMS.
                          </Text>
                          <Text m="0" fontWeight="600">
                            Examples:
                          </Text>
                          <Text m="0">
                            Public: topic tags for search, faceted filters.
                          </Text>
                          <Text m="0">
                            Private: internal labels, review status.
                          </Text>
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
                <Box style={{ width: '30px', flexShrink: 0 }} />
              </Box>

              {/* Form Rows: shimmer only on input fields, one row per visible row */}
              {formRows.map((row, index) => (
                <Box key={index} display="flex" flexDirection="column" gap="4">
                  <TagFormRow
                    formRow={row}
                    index={index}
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
          </Box>
        </DialogBody>
        <DialogFooter style={{ gap: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {mode === 'create' && (
            <Button
              appearance="default-opal"
              size="lg"
              className="opalGenerateButton"
              icon={<IconSparkles size={16} />}
              iconPosition="start"
              onClick={handleGenerate}
              disabled={generateLoading}
              loading={generateLoading}
              aria-label="Generate tag suggestions with Opal"
            >
              Generate
            </Button>
          )}
          <Box style={{ flex: 1 }} />
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
