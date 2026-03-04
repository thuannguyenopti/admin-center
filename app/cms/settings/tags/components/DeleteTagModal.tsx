"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Box,
  Alert,
} from '@optiaxiom/react';
import { Button } from '@/app/components/Button';
import { Text } from '@/app/components/Text';
import { Tag } from '../types';
import { IconChevronRight } from '@tabler/icons-react';

interface DeleteTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onConfirmDelete: () => void;
}

interface ContentAffected {
  pages: number;
  images: number;
}

export function DeleteTagModal({
  open,
  onOpenChange,
  tags,
  onConfirmDelete,
}: DeleteTagModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Calculate total content affected (mock data for demo)
  const contentAffected: ContentAffected = {
    pages: tags.reduce((sum, tag) => sum + Math.floor(tag.usage * 0.3), 0),
    images: tags.reduce((sum, tag) => sum + Math.floor(tag.usage * 0.7), 0),
  };

  const hasContent = contentAffected.pages > 0 || contentAffected.images > 0;

  // Lock page scroll when modal is open so only the modal body scrolls (single scrollbar)
  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
      return () => {
        delete document.body.dataset.modalOpen;
      };
    }
  }, [open]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleExportToCSV = () => {
    // Mock CSV export
    const csvContent = `Tag Name,Slug,Pages,Images\n${tags
      .map((tag) => `${tag.name},${tag.slug},${Math.floor(tag.usage * 0.3)},${Math.floor(tag.usage * 0.7)}`)
      .join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tag-associations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        style={{
          maxWidth: '1088px',
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
          Delete tag
        </DialogHeader>

        <DialogBody
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Box display="flex" flexDirection="column" gap="24">
            {/* Warning Alert */}
            <Alert
              intent="warning"
              style={{
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fbbf24',
              }}
            >
              <Box display="flex" flexDirection="column" gap="8">
                <Text
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Warning
                </Text>
                <Text
                  style={{
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#000000',
                    lineHeight: '24px',
                  }}
                >
                  This will delete and remove any associations the tag(s) have with content.
                </Text>
              </Box>
            </Alert>

            {/* Content Affected Section */}
            {hasContent && (
              <Box display="flex" flexDirection="column" gap="16">
                <Text
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Content affected
                </Text>

                <Box display="flex" flexDirection="column" gap="0">
                  {/* Pages Section */}
                  {contentAffected.pages > 0 && (
                    <Box
                      onClick={() => toggleSection('pages')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ededed',
                      }}
                    >
                      <IconChevronRight
                        size={20}
                        style={{
                          color: '#080736',
                          transform: expandedSections.has('pages') ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Text
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#080736',
                        }}
                      >
                        {contentAffected.pages} pages
                      </Text>
                    </Box>
                  )}

                  {/* Images Section */}
                  {contentAffected.images > 0 && (
                    <Box
                      onClick={() => toggleSection('images')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ededed',
                      }}
                    >
                      <IconChevronRight
                        size={20}
                        style={{
                          color: '#080736',
                          transform: expandedSections.has('images') ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Text
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#080736',
                        }}
                      >
                        {contentAffected.images} images
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Export Button */}
                <Box mt="8">
                  <Button
                    appearance="default"
                    size="md"
                    onClick={handleExportToCSV}
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      letterSpacing: '-0.15px',
                      color: '#0037ff',
                      border: '1px solid #0037ff',
                      backgroundColor: 'transparent',
                    }}
                  >
                    Export to csv
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogBody>

        <DialogFooter
          style={{
            gap: '16px',
            borderTop: '1px solid #ededed',
            paddingTop: '20px',
          }}
        >
          <DialogClose size="lg">Cancel</DialogClose>
          <Button
            appearance="danger"
            size="lg"
            onClick={() => {
              onConfirmDelete();
              onOpenChange(false);
            }}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
