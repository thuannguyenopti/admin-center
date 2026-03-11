"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  SearchInput,
  Text,
  AngleMenuButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  Pagination,
  toaster,
} from '@optiaxiom/react';
import { Button as AppButton } from '@/app/components/Button';
import { Text as AppText } from '@/app/components/Text';
import usePersistentState from '@/app/usePersistentState';
import { Tag, TagFormRow } from './types';
import { initialTags, getAllContentItems, initialPages, type Page } from '@/app/db/initialData';
import { TagsTable } from './components/TagsTable';
import { TagModal } from './components/TagModal';
import { DeleteTagModal } from './components/DeleteTagModal';
import { MergeTagsModal } from './components/MergeTagsModal';
import { UploadTagsModal } from './components/UploadTagsModal';
import { useSelection } from './hooks/useSelection';
import { useTagActions } from './hooks/useTagActions';
import { filterTags } from './utils';
import EmptyStateIllustration from './empty-state.svg';
import { useLayout } from '@/app/context/LayoutContext';

export default function TagsSettings() {
  const { setHidePageHeader } = useLayout();
  const [tags, setTags] = usePersistentState('tags', initialTags);
  const [pages] = usePersistentState('pages', initialPages) as [Page[], any, boolean];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTags, setEditingTags] = useState<Tag[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState<Tag[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [tagsToMerge, setTagsToMerge] = useState<Tag[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [contentTagOverrides, setContentTagOverrides] = usePersistentState(
    'contentTagOverrides',
    {}
  ) as [Record<string, string[]>, (value: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void];
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newlyImportedIds, setNewlyImportedIds] = useState<Set<string>>(new Set());

  // Base content items from pages
  const baseContentItems = useMemo(
    () => getAllContentItems(pages || initialPages),
    [pages]
  );

  // Apply content tag overrides (e.g. after merge) for usage and merge modal
  const contentItems = useMemo(() => {
    const overrides = contentTagOverrides || {};
    return baseContentItems.map((item) =>
      overrides[item.id] ? { ...item, tags: overrides[item.id] } : item
    );
  }, [baseContentItems, contentTagOverrides]);

  const tagUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contentItems.forEach((item) => {
      (item.tags || []).forEach((tagSlug: string) => {
        counts[tagSlug] = (counts[tagSlug] || 0) + 1;
      });
    });
    return counts;
  }, [contentItems]);

  // Merge calculated usage into tags
  const tagsWithUsage = useMemo(() => {
    return tags.map((tag: Tag) => ({
      ...tag,
      usage: tagUsageCounts[tag.slug] || 0,
    }));
  }, [tags, tagUsageCounts]);

  // Update page header visibility based on tags
  useEffect(() => {
    setHidePageHeader(tagsWithUsage.length === 0 && !isModalOpen);
  }, [tagsWithUsage.length, isModalOpen, setHidePageHeader]);

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    toggleAllForTags,
    deselectAll,
    selectedTags,
    selectedCount,
  } = useSelection(tagsWithUsage);

  const { createTags, updateTags, deleteTags, mergeTags } = useTagActions(
    tags,
    setTags
  );

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    return filterTags(tagsWithUsage, searchQuery);
  }, [tagsWithUsage, searchQuery]);

  // Sort tags
  const sortedTags = useMemo(() => {
    const sorted = [...filteredTags];
    sorted.sort((a: Tag, b: Tag) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'slug':
          aValue = a.slug?.toLowerCase() || '';
          bValue = b.slug?.toLowerCase() || '';
          break;
        case 'visibility':
          aValue = a.visibility || '';
          bValue = b.visibility || '';
          break;
        case 'modifiedBy':
          aValue = a.modifiedBy?.toLowerCase() || '';
          bValue = b.modifiedBy?.toLowerCase() || '';
          break;
        case 'usage':
          aValue = a.usage || 0;
          bValue = b.usage || 0;
          break;
        case 'lastModified':
          aValue = new Date(a.lastModified || 0).getTime();
          bValue = new Date(b.lastModified || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTags, sortColumn, sortDirection]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedTags.length / itemsPerPage);
  const paginatedTags = useMemo(() => {
    return sortedTags.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedTags, currentPage]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateClick = () => {
    setModalMode('create');
    setEditingTags([]);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (selectedCount === 0) return;
    setModalMode('edit');
    setEditingTags(selectedTags);
    setIsModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setModalMode('edit');
    setEditingTags([tag]);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) return;
    setTagsToDelete(selectedTags);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTag = (tag: Tag) => {
    setTagsToDelete([tag]);
    setIsDeleteModalOpen(true);
  };

  const handleMergeClick = () => {
    if (selectedCount < 2) return;
    setTagsToMerge(selectedTags);
    setIsMergeModalOpen(true);
  };

  const handleMerge = (primaryTag: TagFormRow) => {
    const sourceIds = tagsToMerge.map((t) => t.id);
    const sourceSlugs = tagsToMerge.map((t) => t.slug);
    const primarySlug = primaryTag.slug;

    mergeTags(sourceIds, primaryTag);

    setContentTagOverrides((prev: Record<string, string[]>) => {
      const next = { ...prev };
      contentItems.forEach((item) => {
        const tags = item.tags || [];
        const hasAny = tags.some((t: string) => sourceSlugs.includes(t));
        if (hasAny) {
          const newTags = [
            ...new Set(
              tags.map((t: string) =>
                sourceSlugs.includes(t) ? primarySlug : t
              )
            ),
          ];
          next[item.id] = newTags;
        }
      });
      return next;
    });

    deselectAll();
    setTagsToMerge([]);
    setIsMergeModalOpen(false);
  };

  const handleConfirmDelete = () => {
    const idsToDelete = tagsToDelete.map((tag) => tag.id);
    deleteTags(idsToDelete);
    deselectAll();
    setTagsToDelete([]);
  };

  const handleSave = (formRows: TagFormRow[]) => {
    if (modalMode === 'create') {
      createTags(formRows);
    } else {
      updateTags(formRows);
    }
    deselectAll();
  };

  const handleUploadImport = (toCreate: TagFormRow[], toUpdate: TagFormRow[]) => {
    const importedIds: string[] = [];
    if (toCreate.length > 0) importedIds.push(...createTags(toCreate));
    if (toUpdate.length > 0) importedIds.push(...updateTags(toUpdate));

    const count = toCreate.length + toUpdate.length;
    if (count > 0) {
      const noun = count === 1 ? 'tag' : 'tags';
      toaster.create(`${count} ${noun} imported successfully.`, { intent: 'success' });
    }

    // Track newly imported IDs for highlighting
    setNewlyImportedIds(new Set(importedIds));

    // Clear the highlight after animation completes (2 seconds)
    setTimeout(() => {
      setNewlyImportedIds(new Set());
    }, 2000);

    setIsUploadModalOpen(false);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending as default
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Prepare content context for tag generation
  const contentContext = useMemo(() => {
    return contentItems.map((item) => ({
      name: item.name,
      baseType: item.baseType,
      tagSlugs: item.tags || [],
    }));
  }, [contentItems]);

  // Show empty state if no tags
  if (tagsWithUsage.length === 0 && !isModalOpen) {
    return (
      <>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="16"
          py="64"
        >
          <EmptyStateIllustration style={{ width: '300px', height: '220px' }} />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="16"
            textAlign="center"
            style={{ maxWidth: '552px' }}
          >
            <Heading
              level="3"
              style={{
                fontSize: '28px',
                fontWeight: '500',
                letterSpacing: '-0.60px',
                color: '#2e3442',
              }}
            >
              No tags
            </Heading>

            <AppText
              style={{
                fontSize: '16px',
                fontWeight: '400',
                letterSpacing: '-0.20px',
                lineHeight: '24px',
                color: '#2e3442',
              }}
            >
              Tags are labels you attach to content (e.g. "featured", "how-to"). Use them to filter and search in the Content Manager, power faceted search, and surface related content. Create tags here, then assign them to pages and other content when editing.{' '}
              <a
                href="#"
                style={{
                  color: '#0037ff',
                  textDecoration: 'none',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Learn more clicked');
                }}
              >
                Learn more
              </a>
            </AppText>

            <AppButton
              appearance="primary"
              style={{
                fontSize: '13px',
                fontWeight: '400',
                letterSpacing: '-0.08px',
                backgroundColor: '#0037ff',
                color: '#ffffff',
                marginTop: '8px',
              }}
              onClick={handleCreateClick}
            >
              Create tags
            </AppButton>
          </Box>
        </Box>

        {/* Modal can still open from empty state */}
        <TagModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          initialTags={editingTags}
          allTags={tagsWithUsage}
          contentContext={contentContext}
          onSave={handleSave}
        />
      </>
    );
  }

  // Show full tags interface when there are tags
  return (
    <>
      {/* Actions Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="24">
        <Box display="flex" alignItems="center">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              width: '264px',
              border: '1px solid #9e9e9e',
              borderRadius: '4px',
            }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap="10">
          {selectedCount > 0 && (
            <>
              <Text fontSize="sm" fontWeight="600" color="fg.secondary">
                {selectedCount} items selected
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AngleMenuButton appearance="default" size="md">
                    Actions
                  </AngleMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleEditClick}>Edit</DropdownMenuItem>
                  {selectedCount > 1 && (
                    <DropdownMenuItem onSelect={handleMergeClick}>
                      Merge
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={handleDeleteSelected}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Button
            appearance="default"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Import
          </Button>
          <Button appearance="primary" size="md" onClick={handleCreateClick}>
            Create
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TagsTable
        tags={paginatedTags}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleAll={() => toggleAllForTags(paginatedTags)}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        newlyImportedIds={newlyImportedIds}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          page={currentPage}
          onPageChange={setCurrentPage}
          mt="24"
        />
      )}

      {/* Modal */}
      <TagModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialTags={editingTags}
        allTags={tagsWithUsage}
        contentContext={contentContext}
        onSave={handleSave}
      />

      {/* Delete Modal */}
      <DeleteTagModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        tags={tagsToDelete}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Merge Modal */}
      <MergeTagsModal
        open={isMergeModalOpen}
        onOpenChange={setIsMergeModalOpen}
        tagsToMerge={tagsToMerge}
        allTags={tagsWithUsage}
        contentItems={contentItems}
        onMerge={handleMerge}
      />

      {/* Upload Modal */}
      <UploadTagsModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        allTags={tagsWithUsage}
        onImport={handleUploadImport}
      />
    </>
  );
}
