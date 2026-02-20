"use client";

import { useState, useMemo } from 'react';
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
import { Category, CategoryFormRow } from './types';
import { initialCategories, getAllContentItems, initialPages, type Page } from '@/app/db/initialData';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryModal } from './components/CategoryModal';
import { UploadCategoriesModal } from './components/UploadCategoriesModal';
import { useSelection } from './hooks/useSelection';
import { useCategoryActions } from './hooks/useCategoryActions';
import { filterCategoriesWithHierarchy } from './utils';
import EmptyStateIllustration from './empty-state.svg';
import { useLayout } from '@/app/context/LayoutContext';

export default function CategoriesSettings() {
  const { setHidePageHeader } = useLayout();
  const [categories, setCategories] = usePersistentState('categories', initialCategories);
  const [pages] = usePersistentState('pages', initialPages) as [Page[], any, boolean];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategories, setEditingCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newlyImportedIds, setNewlyImportedIds] = useState<Set<string>>(new Set());

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

  // Content context for category generation (name, type, category slugs)
  const contentContext = useMemo(
    () =>
      contentItems.map((item) => ({
        name: item.name,
        baseType: item.baseType,
        categorySlugs: item.categories || [],
      })),
    [contentItems]
  );

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    toggleAllForCategories,
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
        case 'visibility':
          aValue = a.visibility?.toLowerCase() || '';
          bValue = b.visibility?.toLowerCase() || '';
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

  const handleImport = async (toCreate: CategoryFormRow[], toUpdate: CategoryFormRow[]) => {
    const importedIds: string[] = [];
    if (toCreate.length > 0) importedIds.push(...createCategories(toCreate));
    if (toUpdate.length > 0) importedIds.push(...updateCategories(toUpdate));

    const count = toCreate.length + toUpdate.length;
    if (count > 0) {
      const noun = count === 1 ? 'category' : 'categories';
      toaster.create(`${count} ${noun} imported successfully.`, { intent: 'success' });
    }

    // Track newly imported IDs for highlighting
    setNewlyImportedIds(new Set(importedIds));

    // Clear the highlight after animation completes (2 seconds)
    setTimeout(() => {
      setNewlyImportedIds(new Set());
    }, 2000);

    setShowImportModal(false);
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
    // Hide the page header for empty state
    setHidePageHeader(true);

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

            <AppText
              style={{
                fontSize: '16px',
                fontWeight: '400',
                letterSpacing: '-0.20px',
                lineHeight: '24px',
                color: '#2e3442',
              }}
            >
              Categories organise your content into a hierarchy (e.g. Sport &gt; Cycling). Use them to structure navigation, filter content, and group related items. Assign categories to content when editing, and create parent categories to build a taxonomy.{' '}
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
              Create
            </AppButton>
          </Box>
        </Box>

        {/* Modal can still open from empty state */}
        <CategoryModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          initialCategories={editingCategories}
          allCategories={categoriesWithUsage}
          contentContext={contentContext}
          onSave={handleSave}
        />
      </>
    );
  }

  // Show page header when there are categories
  setHidePageHeader(false);

  // Show full categories interface when there are categories
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
                    <DropdownMenuItem onSelect={() => console.log('Merge')}>
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
            onClick={() => setShowImportModal(true)}
          >
            Import
          </Button>
          <Button appearance="primary" size="md" onClick={handleCreateClick}>
            Create
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CategoriesTable
        categories={paginatedCategories}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleAll={toggleAllForCategories}
        onToggleExpand={toggleExpanded}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
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
      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialCategories={editingCategories}
        allCategories={categoriesWithUsage}
        contentContext={contentContext}
        onSave={handleSave}
      />

      {/* Import Modal */}
      <UploadCategoriesModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        allCategories={categoriesWithUsage}
        onImport={handleImport}
      />
    </>
  );
}
