"use client";

import { useState, useMemo } from 'react';
import {
  Box,
  Heading,
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
import { Category, CategoryFormRow } from './types';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryModal } from './components/CategoryModal';
import { useSelection } from './hooks/useSelection';
import { useCategoryActions } from './hooks/useCategoryActions';
import { filterCategoriesWithHierarchy } from './utils';
import { IconCheck } from '@tabler/icons-react';
import EmptyStateIllustration from './empty-state.svg';

export default function CategoriesSettings() {
  const [categories, setCategories] = usePersistentState('categories', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategories, setEditingCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    deselectAll,
    selectedCategories,
    selectedCount,
  } = useSelection(categories);

  const { createCategories, updateCategories, deleteCategories, toggleExpanded } =
    useCategoryActions(categories, setCategories);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return filterCategoriesWithHierarchy(categories, searchQuery);
  }, [categories, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredCategories, currentPage]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateClick = () => {
    setModalMode('create');
    setEditingCategories([]);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (selectedCount === 0) return;
    setModalMode('edit');
    setEditingCategories(selectedCategories);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setEditingCategories([category]);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) return;
    if (confirm(`Delete ${selectedCount} selected categories?`)) {
      deleteCategories(Array.from(selectedIds));
      deselectAll();
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this category?')) {
      deleteCategories([id]);
    }
  };

  const handleSave = (formRows: CategoryFormRow[]) => {
    if (modalMode === 'create') {
      createCategories(formRows);
    } else {
      updateCategories(formRows);
    }
    deselectAll();
  };

  // Show empty state if no categories
  if (categories.length === 0 && !isModalOpen) {
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
              No categories
            </Heading>

            <Text
              style={{
                fontSize: '16px',
                fontWeight: '400',
                letterSpacing: '-0.20px',
                lineHeight: '24px',
                color: '#2e3442',
              }}
            >
              Categories help you classify and organise your content, making it easier to
              filter, search, and navigate. Create your first category to begin.{' '}
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
              Create categories
            </Button>
          </Box>
        </Box>

        {/* Modal can still open from empty state */}
        <CategoryModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          initialCategories={editingCategories}
          allCategories={categories}
          onSave={handleSave}
        />
      </>
    );
  }

  // Show full categories interface when there are categories
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
                  <DropdownMenuItem onSelect={() => console.log('Merge')}>Merge</DropdownMenuItem>
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
          Create Categories
        </Button>
      </Box>

      {/* Table */}
      <CategoriesTable
        categories={paginatedCategories}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleAll={toggleAll}
        onToggleExpand={toggleExpanded}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
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
      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialCategories={editingCategories}
        allCategories={categories}
        onSave={handleSave}
      />
    </>
  );
}
