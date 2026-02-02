import { Checkbox } from '@optiaxiom/react';
import { Category } from '../types';
import { Table, Tr, Th, Td } from '@/app/components/Table';
import { CategoryRow } from './CategoryRow';
import { getChildren } from '../utils';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

interface CategoriesTableProps {
  categories: Category[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function CategoriesTable({
  categories,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onToggleExpand,
  onEdit,
  onDelete,
  sortColumn,
  sortDirection,
  onSort,
}: CategoriesTableProps) {
  const rootCategories = getChildren(null, categories);
  const allSelected = categories.length > 0 && selectedIds.size === categories.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < categories.length;

  const renderSortIcon = (column: string) => {
    const isActive = sortColumn === column;
    return (
      <span
        style={{
          visibility: isActive ? 'visible' : 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '4px',
          width: '14px',
          height: '14px',
          verticalAlign: 'middle',
        }}
      >
        {sortDirection === 'asc' ? (
          <IconChevronUp size={14} />
        ) : (
          <IconChevronDown size={14} />
        )}
      </span>
    );
  };

  const handleHeaderClick = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

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
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('name')}
          >
            Name{renderSortIcon('name')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('slug')}
          >
            Slug{renderSortIcon('slug')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('status')}
          >
            Status{renderSortIcon('status')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('visibility')}
          >
            Visibility{renderSortIcon('visibility')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('modifiedBy')}
          >
            Modified by{renderSortIcon('modifiedBy')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('usage')}
          >
            Usage{renderSortIcon('usage')}
          </Th>
          <Th
            style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => handleHeaderClick('lastModified')}
          >
            Last Modified{renderSortIcon('lastModified')}
          </Th>
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
