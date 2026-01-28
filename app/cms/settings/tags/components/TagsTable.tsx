import { Checkbox } from '@optiaxiom/react';
import { Tag } from '../types';
import { Table, Tr, Th } from '@/app/components/Table';
import { TagRow } from './TagRow';

interface TagsTableProps {
  tags: Tag[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export function TagsTable({
  tags,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onEdit,
  onDelete,
}: TagsTableProps) {
  const allSelected = tags.length > 0 && selectedIds.size === tags.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < tags.length;

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
          <Th>Visibility</Th>
          <Th>Modified by</Th>
          <Th>Usage</Th>
          <Th>Last Modified</Th>
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
