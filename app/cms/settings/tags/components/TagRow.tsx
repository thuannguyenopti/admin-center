import { Checkbox, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from '@optiaxiom/react';
import { useRouter } from 'next/navigation';
import { Tag } from '../types';
import { Tr, Td } from '@/app/components/Table';
import { IconDots } from '@tabler/icons-react';
import TagIcon from '../tag-icon.svg';

interface TagRowProps {
  tag: Tag;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export function TagRow({
  tag,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
}: TagRowProps) {
  const router = useRouter();

  const handleUsageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tag.usage > 0) {
      router.push(`/cms/content?tag=${tag.slug}`);
    }
  };

  return (
    <Tr
      className={isSelected ? 'bg-[var(--ax-colors-bg-accent-subtle)]' : ''}
    >
      <Td type="raw">
        <div className="flex items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(tag.id)}
          />
        </div>
      </Td>
      <Td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TagIcon
            style={{
              width: '14px',
              height: '14px',
              color: 'var(--ax-colors-fg-default)',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              color: 'var(--ax-colors-fg-accent-strong)',
            }}
          >
            {tag.name}
          </span>
        </div>
      </Td>
      <Td>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            fontFamily: 'Hack, monospace',
            color: 'var(--ax-colors-fg-secondary)',
          }}
        >
          /{tag.slug}
        </span>
      </Td>
      <Td>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.15px',
            color: 'var(--ax-colors-fg-default)',
          }}
        >
          {tag.visibility.charAt(0).toUpperCase() + tag.visibility.slice(1)}
        </span>
      </Td>
      <Td>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.15px',
            color: 'var(--ax-colors-fg-default)',
          }}
        >
          {tag.modifiedBy}
        </span>
      </Td>
      <Td>
        <span
          onClick={tag.usage > 0 ? handleUsageClick : undefined}
          className={tag.usage > 0 ? 'cursor-pointer hover:underline' : ''}
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.15px',
            color: tag.usage > 0 ? 'var(--ax-colors-fg-accent-strong)' : 'var(--ax-colors-fg-default)',
          }}
          title={tag.usage > 0 ? `View ${tag.usage} content items with this tag` : undefined}
        >
          {tag.usage}
        </span>
      </Td>
      <Td>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.15px',
            color: 'var(--ax-colors-fg-default)',
          }}
        >
          {tag.lastModified}
        </span>
      </Td>
      <Td type="button">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-[var(--ax-colors-bg-default-hovered)] rounded">
              <IconDots size={16} style={{ color: 'var(--ax-colors-fg-default)' }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onEdit(tag)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(tag)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>
    </Tr>
  );
}
