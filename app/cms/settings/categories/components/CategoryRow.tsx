import {
  Badge,
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
import { IconDots } from '@tabler/icons-react';
import ChevronDownIcon from '@/public/icons/chevron-down.svg';

interface CategoryRowProps {
  category: Category;
  allCategories: Category[];
  depth: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
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
}: CategoryRowProps) {
  const router = useRouter();
  const children = getChildren(category.id, allCategories);
  const hasChildren = children.length > 0;
  const indent = depth * 32; // 32px per level

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
        className={`${isSelected ? 'bg-[var(--ax-colors-bg-accent-subtle)]' : ''} hover:bg-[var(--ax-colors-bg-default-hovered)]`}
      >
        <Td type="raw">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(category.id)}
            />
            {hasChildren ? (
              <button
                onClick={() => onToggleExpand(category.id)}
                className="p-1 hover:bg-[var(--ax-colors-bg-default-hovered)] rounded"
                style={{ marginLeft: '8px' }}
              >
                <ChevronDownIcon
                  style={{
                    width: '11px',
                    height: '5px',
                    transform: category.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                    color: 'var(--ax-colors-fg-default)',
                  }}
                />
              </button>
            ) : (
              <div style={{ width: '27px' }} />
            )}
          </div>
        </Td>
        <Td>
          <span
            className="cursor-pointer hover:underline"
            style={{ color: 'var(--ax-colors-fg-accent-strong)', fontWeight: 400 }}
            onClick={() => onEdit(category)}
          >
            {category.name}
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
          />
        ))}
    </>
  );
}
