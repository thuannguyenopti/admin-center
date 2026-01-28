import { Checkbox } from '@optiaxiom/react';
import { Category } from '../types';
import { Table, Tr, Th, Td } from '@/app/components/Table';
import { CategoryRow } from './CategoryRow';
import { getChildren } from '../utils';

interface CategoriesTableProps {
  categories: Category[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoriesTable({
  categories,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onToggleExpand,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const rootCategories = getChildren(null, categories);
  const allSelected = categories.length > 0 && selectedIds.size === categories.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < categories.length;

  return (
    <Table>
      <thead>
        <Tr>
          <Th style={{ width: '56px' }}>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={onToggleAll}
            />
          </Th>
          <Th>Name</Th>
          <Th>Slug</Th>
          <Th>Status</Th>
          <Th>Modified by</Th>
          <Th>Usage</Th>
          <Th>Last Modified</Th>
          <Th style={{ width: '56px' }}></Th>
        </Tr>
      </thead>
      <tbody>
        {rootCategories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            allCategories={categories}
            depth={0}
            isSelected={selectedIds.has(category.id)}
            onToggleSelection={onToggleSelection}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </Table>
  );
}
