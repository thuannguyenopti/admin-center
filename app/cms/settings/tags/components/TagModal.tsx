import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
  Button,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { TagFormRow as FormRowType, Tag } from '../types';
import { TagFormRow } from './TagFormRow';
import { useState, useEffect, useCallback } from 'react';
import { generateSlug, isSlugUnique } from '../utils';
import { IconSparkles } from '@optimizely/axiom-icons';

interface TagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialTags?: Tag[];
  allTags: Tag[];
  onSave: (formRows: FormRowType[]) => void;
}

export function TagModal({
  open,
  onOpenChange,
  mode,
  initialTags = [],
  allTags,
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
    if (allTags.length === 0) return;
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: 'Suggest new tag names that fit the existing taxonomy',
          tagTaxonomy: allTags.map((t) => ({ name: t.name, slug: t.slug })),
        }),
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
  }, [allTags]);

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
          style={{
            fontSize: '22.99px',
            fontWeight: 300,
            letterSpacing: '-0.44px',
            color: '#080736',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {title}
          <Text
            style={{
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              color: '#080736',
            }}
          >
            Add and manage tags to label and filter your content.
          </Text>
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
                  Tags
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
                  Visibility
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
                  disabled={generateLoading || allTags.length === 0}
                  loading={generateLoading}
                  aria-label="Generate tag suggestions with Opal"
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
