'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
  Alert,
  Text,
} from '@optiaxiom/react';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Tag, TagFormRow } from '../types';
import { TagFormRow as TagFormRowComponent } from './TagFormRow';
import { getAffectedContentCounts, isSlugUnique, type ContentItemForCount } from '../utils';

interface MergeTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagsToMerge: Tag[];
  allTags: Tag[];
  contentItems: ContentItemForCount[];
  onMerge: (primaryTag: TagFormRow) => void;
}

export function MergeTagsModal({
  open,
  onOpenChange,
  tagsToMerge,
  allTags,
  contentItems,
  onMerge,
}: MergeTagsModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [primaryRow, setPrimaryRow] = useState<TagFormRow>({
    name: '',
    slug: '',
    visibility: 'public',
  });
  const [primaryError, setPrimaryError] = useState<string>('');

  useEffect(() => {
    if (open && tagsToMerge.length > 0) {
      setStep(1);
      const first = tagsToMerge[0];
      setPrimaryRow({
        id: first.id,
        name: first.name,
        slug: first.slug,
        visibility: first.visibility,
      });
      setPrimaryError('');
    }
  }, [open, tagsToMerge]);

  const tagsToMergeIds = tagsToMerge.map((t) => t.id);
  const allTagsExcludingMerged = allTags.filter((t) => !tagsToMergeIds.includes(t.id));

  // Lock page scroll when modal is open so only the modal body scrolls (single scrollbar)
  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
      return () => {
        delete document.body.dataset.modalOpen;
      };
    }
  }, [open]);

  const handlePrimaryChange = useCallback(
    (_index: number, field: keyof TagFormRow, value: string) => {
      setPrimaryRow((prev) => ({ ...prev, [field]: value }));
      setPrimaryError('');
    },
    []
  );

  const handlePrimarySlugBlur = useCallback(() => {
    if (!primaryRow.slug) return;
    if (!isSlugUnique(primaryRow.slug, primaryRow.id, allTagsExcludingMerged)) {
      setPrimaryError('Slug must be unique');
    }
  }, [primaryRow.slug, primaryRow.id, allTagsExcludingMerged]);

  const validatePrimary = (): boolean => {
    if (!primaryRow.name || primaryRow.name.length < 2) {
      setPrimaryError('Tag name is required (min 2 characters)');
      return false;
    }
    if (!primaryRow.slug) {
      setPrimaryError('Slug is required');
      return false;
    }
    if (!isSlugUnique(primaryRow.slug, primaryRow.id, allTagsExcludingMerged)) {
      setPrimaryError('Slug must be unique');
      return false;
    }
    setPrimaryError('');
    return true;
  };

  const handleContinue = () => {
    if (!validatePrimary()) return;
    setStep(2);
  };

  const handleMerge = () => {
    onMerge(primaryRow);
    onOpenChange(false);
  };

  const sourceSlugs = tagsToMerge.map((t) => t.slug);
  const affectedCounts = getAffectedContentCounts(contentItems, sourceSlugs);

  if (tagsToMerge.length === 0) return null;

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
          }}
        >
          Merge tags
        </DialogHeader>
        <DialogBody
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {step === 1 ? (
            <Box display="flex" flexDirection="column" gap="16">
              <Text
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '-0.15px',
                  color: '#080736',
                  lineHeight: '20px',
                }}
              >
                Combine duplicate or related tags into a single tag. All linked
                content will be reassigned to the primary tag.
              </Text>

              {/* Select tags to merge */}
              <Box display="flex" flexDirection="column" gap="8">
                <Text
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                  }}
                >
                  Select tags to merge
                </Text>
                <Box display="flex" flexDirection="column" gap="2">
                  <Box display="flex" gap="10" mb="4">
                    <Box flex="1" style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.15px', color: '#080736', minWidth: 0 }}>
                      Tag
                    </Box>
                    <Box flex="1" style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.15px', color: '#080736', minWidth: 0 }}>
                      Slug
                    </Box>
                    <Box flex="1" style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.15px', color: '#080736', minWidth: 0 }}>
                      Visibility
                    </Box>
                    <Box style={{ width: '30px', flexShrink: 0 }} />
                  </Box>
                  {tagsToMerge.map((tag) => (
                    <Box key={tag.id} display="flex" gap="10" alignItems="center">
                      <Box flex="1" style={{ minWidth: 0 }}>
                        <Input
                          value={tag.name}
                          readOnly
                          disabled
                          style={{
                            width: '100%',
                            border: '1px solid #e5e5e5',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 400,
                            letterSpacing: '-0.15px',
                            color: '#080736',
                            backgroundColor: '#f5f5f5',
                          }}
                        />
                      </Box>
                      <Box flex="1" style={{ minWidth: 0 }}>
                        <Input
                          value={`/${tag.slug}`}
                          readOnly
                          disabled
                          style={{
                            width: '100%',
                            border: '1px solid #e5e5e5',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'Hack, monospace',
                            color: '#707070',
                            backgroundColor: '#f5f5f5',
                          }}
                        />
                      </Box>
                      <Box flex="1" style={{ minWidth: 0 }}>
                        <Input
                          value={tag.visibility.charAt(0).toUpperCase() + tag.visibility.slice(1)}
                          readOnly
                          disabled
                          style={{
                            width: '100%',
                            border: '1px solid #e5e5e5',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#080736',
                            backgroundColor: '#f5f5f5',
                          }}
                        />
                      </Box>
                      <Box style={{ width: '30px', flexShrink: 0 }} />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Select primary tag to keep */}
              <Box display="flex" flexDirection="column" gap="8">
                <Text
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '-0.15px',
                    color: '#080736',
                  }}
                >
                  Select primary tag to keep
                </Text>
                <Box display="flex" flexDirection="column" gap="4">
                  <TagFormRowComponent
                    formRow={primaryRow}
                    index={0}
                    onChange={handlePrimaryChange}
                    onSlugBlur={handlePrimarySlugBlur}
                    onDelete={() => { }}
                    onAdd={() => { }}
                    showDelete={false}
                    showAdd={false}
                  />
                  {primaryError && (
                    <Box style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {primaryError}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap="24">
              {/* Summary of changes - 2 column From / To layout */}
              <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="md" fontWeight="600" color="fg.default">
                  Summary of changes
                </Text>
                <Box display="flex" gap="24" alignItems="center">
                  {/* From column */}
                  <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
                    <Text fontSize="sm" fontWeight="600" color="fg.secondary">
                      From ({tagsToMerge.length} tags)
                    </Text>
                    <Text fontSize="md" color="fg.default" style={{ lineHeight: '20px' }}>
                      {tagsToMerge.map((t) => t.name).join(', ')}
                    </Text>
                  </Box>
                  {/* Arrow */}
                  <Box style={{ flexShrink: 0 }} display="flex" alignItems="center">
                    <Text fontSize="lg" fontWeight="600" color="fg.secondary">
                      →
                    </Text>
                  </Box>
                  {/* To column */}
                  <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
                    <Text fontSize="sm" fontWeight="600" color="fg.secondary">
                      To (1 tag)
                    </Text>
                    <Text fontSize="md" color="fg.default" style={{ lineHeight: '20px' }}>
                      {primaryRow.name}
                    </Text>
                  </Box>
                </Box>
              </Box>

              {/* Affected content */}
              <Box
                display="flex"
                flexDirection="column"
                gap="8"
                style={{
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  padding: '16px',
                }}
              >
                <Text fontSize="md" fontWeight="600" color="fg.default">
                  Affected content
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>
                    <Text fontSize="md" color="fg.default" asChild>
                      <span>· {affectedCounts.pages} pages</span>
                    </Text>
                  </li>
                  <li>
                    <Text fontSize="md" color="fg.default" asChild>
                      <span>· {affectedCounts.images} images</span>
                    </Text>
                  </li>
                </ul>
              </Box>

              {/* Warning - use Axiom typography tokens (fontSize md = 14px/20px, fg.default) */}
              <Alert intent="warning" rounded="md">
                <Text fontSize="md" color="fg.default">
                  Once merged, the tags and their relationships cannot be restored.
                </Text>
              </Alert>
            </Box>
          )}
        </DialogBody>
        <DialogFooter style={{ gap: '16px' }}>
          <DialogClose size="lg">Cancel</DialogClose>
          {step === 1 ? (
            <Button
              appearance="primary"
              size="lg"
              onClick={handleContinue}
              style={{ backgroundColor: '#0037ff', color: '#ffffff' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              appearance="primary"
              size="lg"
              onClick={handleMerge}
              style={{ backgroundColor: '#0037ff', color: '#ffffff' }}
            >
              Merge
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
