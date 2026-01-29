"use client";

import { useState, useMemo } from 'react';
import {
  Box,
  SearchInput,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  Pagination,
} from '@optiaxiom/react';
import { Button } from '@/app/components/Button';
import { Text } from '@/app/components/Text';
import usePersistentState from '@/app/usePersistentState';
import { Tag, TagFormRow } from './types';
import { initialTags, getAllContentItems, initialPages, type Page } from '@/app/db/initialData';
import { TagsTable } from './components/TagsTable';
import { TagModal } from './components/TagModal';
import { DeleteTagModal } from './components/DeleteTagModal';
import { useSelection } from './hooks/useSelection';
import { useTagActions } from './hooks/useTagActions';
import { filterTags } from './utils';
import { IconCheck } from '@tabler/icons-react';
import EmptyStateIllustration from './empty-state.svg';

export default function TagsSettings() {
  const [tags, setTags] = usePersistentState('tags', initialTags);
  const [pages] = usePersistentState('pages', initialPages) as [Page[], any, boolean];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTags, setEditingTags] = useState<Tag[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState<Tag[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate actual tag usage from content items
  const contentItems = useMemo(() => getAllContentItems(pages || initialPages), [pages]);
  
  const tagUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contentItems.forEach(item => {
      (item.tags || []).forEach(tagSlug => {
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

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    deselectAll,
    selectedTags,
    selectedCount,
  } = useSelection(tagsWithUsage);

  const { createTags, updateTags, deleteTags } = useTagActions(tags, setTags);

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
            <Text
              style={{
                fontSize: '16px',
                fontWeight: '400',
                letterSpacing: '-0.20px',
                lineHeight: '24px',
                color: '#2e3442',
              }}
            >
              Tags help you organise and surface related content. Create your first tag
              to get started.{' '}
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
            </Text>

            <Button
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
            </Button>
          </Box>
        </Box>

        {/* Modal can still open from empty state */}
        <TagModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          initialTags={editingTags}
          allTags={tagsWithUsage}
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
        <Box display="flex" alignItems="center" gap="10">
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
          {selectedCount > 0 && (
            <>
              <Text
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '-0.08px',
                  color: '#222222',
                }}
              >
                {selectedCount} items selected
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    appearance="default"
                    size="md"
                    style={{
                      gap: '4px',
                      border: '1px solid #9e9e9e',
                      borderRadius: '4px',
                      boxShadow: 'inset 0px 0px 8px 2px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 400,
                        letterSpacing: '-0.08px',
                      }}
                    >
                      Actions
                    </span>
                    <img
                      src="/icons/chevron-down.svg"
                      alt="dropdown"
                      style={{
                        width: '11px',
                        height: '5px',
                        filter: 'brightness(0) saturate(100%)',
                      }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleEditClick}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                      <span>Edit</span>
                      <IconCheck size={14} style={{ color: '#080736' }} />
                    </Box>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleDeleteSelected}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </Box>
        <Button
          appearance="primary"
          size="md"
          onClick={handleCreateClick}
          style={{
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '-0.08px',
            backgroundColor: '#0037ff',
            color: '#ffffff',
          }}
        >
          Create tags
        </Button>
      </Box>

      {/* Table */}
      <TagsTable
        tags={paginatedTags}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleAll={toggleAll}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
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
        onSave={handleSave}
      />

      {/* Delete Modal */}
      <DeleteTagModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        tags={tagsToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
