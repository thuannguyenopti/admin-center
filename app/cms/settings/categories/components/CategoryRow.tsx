import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from '@optiaxiom/react';
import { useRouter } from 'next/navigation';
import { Category } from '../types';
import { Tr, Td } from '@/app/components/Table';
import { getChildren } from '../utils';
import { IconDots, IconFolder } from '@tabler/icons-react';
import ChevronDownIcon from '@/public/icons/chevron-down.svg';
import Item from '@/app/components/Item';

interface CategoryRowProps {
  category: Category;
  allCategories: Category[];
  depth: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  newlyImportedIds?: Set<string>;
}

export function CategoryRow({
  category,
  allCategories,
  depth,
  isSelected,
  onToggleSelection,
  onToggleExpand,
  onEdit,
  onDelete,
  newlyImportedIds = new Set(),
}: CategoryRowProps) {
  const router = useRouter();
  const children = getChildren(category.id, allCategories);
  const hasChildren = children.length > 0;
  const indent = depth * 32; // 32px per level
  const isNewlyImported = newlyImportedIds.has(category.id);

  const statusColors: Record<string, 'neutral' | 'success' | 'warning'> = {
    draft: 'neutral',
    published: 'success',
    'in-review': 'warning',
  };

  const handleUsageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (category.usage > 0) {
      router.push(`/cms/content?category=${category.slug}`);
    }
  };

  return (
    <>
      <Tr
        className={`${isSelected ? 'bg-[var(--ax-colors-bg-accent-subtle)]' : ''} hover:bg-[var(--ax-colors-bg-default-hovered)] ${isNewlyImported ? 'newly-imported' : ''}`}
      >
        <Td type="raw">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(category.id)}
            />
            {hasChildren ? (
              <Button
                appearance="subtle"
                size="sm"
                onClick={() => onToggleExpand(category.id)}
                aria-label={category.isExpanded ? 'Collapse' : 'Expand'}
                icon={
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: category.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <ChevronDownIcon
                      style={{
                        width: '11px',
                        height: '5px',
                        color: 'var(--ax-colors-fg-default)',
                      }}
                    />
                  </span>
                }
                style={{ marginLeft: '8px' }}
              />
            ) : (
              <div style={{ width: '27px' }} />
            )}
          </div>
        </Td>
        <Td type="header">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => onEdit(category)}
          >
            <Item
              icon={<IconFolder size={16} style={{ color: 'var(--ax-colors-fg-default)' }} />}
              title={category.name}
            />
          </span>
        </Td>
        <Td>
          <span style={{ fontFamily: 'Hack, monospace', fontSize: '14px' }}>
            {depth > 0 ? `../${category.slug}` : `/${category.slug}`}
          </span>
        </Td>
        <Td>
          <Badge intent={statusColors[category.status] || 'neutral'}>
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </Badge>
        </Td>
        <Td>
          {category.visibility.charAt(0).toUpperCase() + category.visibility.slice(1)}
        </Td>
        <Td>{category.modifiedBy}</Td>
        <Td>
          <span
            onClick={category.usage > 0 ? handleUsageClick : undefined}
            className={category.usage > 0 ? 'cursor-pointer hover:underline' : ''}
            style={{
              color: category.usage > 0 ? 'var(--ax-colors-fg-accent-strong)' : 'var(--ax-colors-fg-default)',
            }}
            title={category.usage > 0 ? `View ${category.usage} content items in this category` : undefined}
          >
            {category.usage}
          </span>
        </Td>
        <Td>{category.lastModified}</Td>
        <Td type="button">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-[var(--ax-colors-bg-default-hovered)] rounded">
                <IconDots size={16} style={{ color: 'var(--ax-colors-fg-default)' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onEdit(category)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(category.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Td>
      </Tr>
      {category.isExpanded &&
        children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            allCategories={allCategories}
            depth={depth + 1}
            isSelected={isSelected}
            onToggleSelection={onToggleSelection}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            newlyImportedIds={newlyImportedIds}
          />
        ))}
    </>
  );
}
