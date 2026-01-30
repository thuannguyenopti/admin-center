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
import { initialCategories, getAllContentItems, initialPages, type Page } from '@/app/db/initialData';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryModal } from './components/CategoryModal';
import { useSelection } from './hooks/useSelection';
import { useCategoryActions } from './hooks/useCategoryActions';
import { filterCategoriesWithHierarchy } from './utils';
import { IconCheck } from '@tabler/icons-react';
import EmptyStateIllustration from './empty-state.svg';
import ChevronDownIcon from '@/public/icons/chevron-down.svg';

export default function CategoriesSettings() {
  const [categories, setCategories] = usePersistentState('categories', initialCategories);
  const [pages] = usePersistentState('pages', initialPages) as [Page[], any, boolean];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategories, setEditingCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate actual category usage from content items
  const contentItems = useMemo(() => getAllContentItems(pages || initialPages), [pages]);
  
  const categoryUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contentItems.forEach(item => {
      (item.categories || []).forEach(catSlug => {
        counts[catSlug] = (counts[catSlug] || 0) + 1;
      });
    });
    return counts;
  }, [contentItems]);

  // Merge calculated usage into categories
  const categoriesWithUsage = useMemo(() => {
    return categories.map((cat: Category) => ({
      ...cat,
      usage: categoryUsageCounts[cat.slug] || 0,
    }));
  }, [categories, categoryUsageCounts]);

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    deselectAll,
    selectedCategories,
    selectedCount,
  } = useSelection(categoriesWithUsage);

  const { createCategories, updateCategories, deleteCategories, toggleExpanded } =
    useCategoryActions(categories, setCategories);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return filterCategoriesWithHierarchy(categoriesWithUsage, searchQuery);
  }, [categoriesWithUsage, searchQuery]);

  // Sort categories
  const sortedCategories = useMemo(() => {
    const sorted = [...filteredCategories];
    sorted.sort((a: Category, b: Category) => {
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
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
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
  }, [filteredCategories, sortColumn, sortDirection]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    return sortedCategories.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedCategories, currentPage]);

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

  // Show empty state if no categories
  if (categoriesWithUsage.length === 0 && !isModalOpen) {
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
          allCategories={categoriesWithUsage}
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
                    <ChevronDownIcon
                      style={{
                        width: '11px',
                        height: '5px',
                        color: 'var(--ax-colors-fg-default)',
                      }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleEditClick}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                      <span>Edit</span>
                      <IconCheck size={14} style={{ color: 'var(--ax-colors-fg-default)' }} />
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
      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialCategories={editingCategories}
        allCategories={categoriesWithUsage}
        onSave={handleSave}
      />
    </>
  );
}
