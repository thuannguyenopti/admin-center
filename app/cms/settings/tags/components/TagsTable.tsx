import { Checkbox } from '@optiaxiom/react';
import { Tag } from '../types';
import { Table, Tr, Th } from '@/app/components/Table';
import { TagRow } from './TagRow';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

interface TagsTableProps {
  tags: Tag[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function TagsTable({
  tags,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onEdit,
  onDelete,
  sortColumn,
  sortDirection,
  onSort,
}: TagsTableProps) {
  const allSelected =
    tags.length > 0 && tags.every((tag) => selectedIds.has(tag.id));
  const someSelected =
    tags.some((tag) => selectedIds.has(tag.id)) && !allSelected;

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
        {tags.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            isSelected={selectedIds.has(tag.id)}
            onToggleSelection={onToggleSelection}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </Table>
  );
}
