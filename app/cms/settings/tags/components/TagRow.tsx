import { Checkbox, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from '@optiaxiom/react';
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
  return (
    <Tr
      style={
        isSelected
          ? {
              backgroundColor: '#f0f3ff',
            }
          : undefined
      }
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
              color: '#080736',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.15px',
              color: '#0037ff',
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
            color: '#707070',
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
            color: '#080736',
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
            color: '#080736',
          }}
        >
          {tag.modifiedBy}
        </span>
      </Td>
      <Td>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.15px',
            color: '#0037ff',
          }}
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
            color: '#080736',
          }}
        >
          {tag.lastModified}
        </span>
      </Td>
      <Td type="button">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <IconDots size={16} style={{ color: '#080736' }} />
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
