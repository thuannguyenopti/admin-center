import { ImportConfig } from '@/app/shared/components/ImportModal/types';
import { Tag, TagFormRow, TagParsedRow } from '../types';
import { parseTagsCSV } from '../utils';
import { Text } from '@/app/components/Text';
import { Badge, Group, Select, SelectTrigger, SelectContent } from '@optiaxiom/react';

export const tagImportConfig: ImportConfig<Tag, TagFormRow, TagParsedRow> = {
  entityName: 'tag',
  entityNamePlural: 'tags',

  csvHeaders: ['name', 'slug', 'visibility'],

  templateData: `name,slug,visibility
Getting Started,getting-started,public
Advanced Guide,advanced-guide,private
Product Update,,public
Tips & Tricks,tips-tricks,public`,

  parseCSV: async (file: File, existingTags: Tag[]) => {
    const result = await parseTagsCSV(file, existingTags);
    // Adapt the result to use existingTag instead of existingEntity
    return {
      rows: result.rows.map(row => ({
        ...row,
        existingEntity: (row as any).existingTag,
        existingTag: (row as any).existingTag,
      })) as TagParsedRow[],
      stats: result.stats,
    };
  },

  tableColumns: [
    {
      key: 'rowNumber',
      label: '#',
      width: '50px',
      render: (row) => (
        <Text fontSize="sm" color="fg.secondary">
          {row.rowNumber}
        </Text>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      width: '200px',
      render: (row) => row.name,
    },
    {
      key: 'slug',
      label: 'Slug',
      width: '180px',
      render: (row) => (
        <Text fontSize="sm" fontFamily="mono" color="fg.secondary">
          /{row.slug}
        </Text>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      width: '100px',
      render: (row) => (
        <Text fontSize="sm" style={{ textTransform: 'capitalize' }}>
          {row.visibility}
        </Text>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (row) => {
        if (row.status === 'error') {
          return <Badge intent="danger">Error</Badge>;
        }
        if (row.status === 'duplicate-in-csv') {
          return <Badge intent="information">Duplicate</Badge>;
        }
        if (row.status === 'exists-in-system') {
          return <Badge intent="warning">Conflict</Badge>;
        }
        return null;
      },
    },
    {
      key: 'action',
      label: 'Action',
      width: '350px',
      render: (row, _originalIndex, _allTags, resolutions, handleResolutionChange) => {
        if (row.status === 'exists-in-system') {
          const resolution = resolutions?.get(row.slug);
          return (
            <Group flexDirection="column" gap="4">
              <Select
                value={resolution?.action || 'skip'}
                onValueChange={(value) =>
                  handleResolutionChange?.(
                    row.slug,
                    value as 'skip' | 'update' | 'create-new'
                  )
                }
                options={[
                  { label: 'Skip', value: 'skip' },
                  { label: 'Update', value: 'update' },
                  { label: 'Create new', value: 'create-new' },
                ]}
              >
                <SelectTrigger size="sm">
                  {resolution?.action === 'skip' && 'Skip'}
                  {resolution?.action === 'update' && 'Update'}
                  {resolution?.action === 'create-new' && 'Create new'}
                  {!resolution?.action && 'Skip'}
                </SelectTrigger>
                <SelectContent />
              </Select>
              {resolution?.action === 'create-new' && resolution.newSlug && (
                <Text fontSize="xs" color="fg.secondary">
                  Will create with slug: /{resolution.newSlug}
                </Text>
              )}
              {row.existingTag && (
                <Text fontSize="xs" color="fg.secondary">
                  Existing tag: {row.existingTag.name} • {row.existingTag.visibility}
                </Text>
              )}
            </Group>
          );
        }

        if (row.status === 'error' && row.error) {
          return (
            <Text fontSize="xs" color="fg.error">
              {row.error}
            </Text>
          );
        }

        if (row.status === 'duplicate-in-csv') {
          return (
            <Text fontSize="xs" color="fg.warning">
              Duplicate found - only the first will be imported
            </Text>
          );
        }

        return null;
      },
    },
  ],

  transformToFormRow: (row, resolution) => {
    // Skip errors and duplicates
    if (row.status === 'error' || row.status === 'duplicate-in-csv') {
      return null;
    }

    // Skip if conflict resolution says to skip
    if (resolution?.action === 'skip') {
      return null;
    }

    // Handle valid rows (new tags)
    if (row.status === 'valid') {
      return {
        name: row.name,
        slug: row.slug,
        visibility: row.visibility,
      };
    }

    // Handle existing tags with conflict resolution
    if (row.status === 'exists-in-system') {
      if (resolution?.action === 'update' && row.existingTag) {
        return {
          id: row.existingTag.id,
          name: row.name,
          slug: row.slug,
          visibility: row.visibility,
        };
      }

      if (resolution?.action === 'create-new' && resolution.newSlug) {
        return {
          name: row.name,
          slug: resolution.newSlug,
          visibility: row.visibility,
        };
      }
    }

    return null;
  },

  // No sorting needed for flat tags structure
  sortForImport: undefined,

  // No warnings needed for tags (no hierarchy to validate)
  detectWarnings: undefined,

  convertJsonToCsv: (data: any[]): string => {
    if (!Array.isArray(data)) {
      throw new Error('Expected JSON array of tags');
    }

    const headers = ['name', 'slug', 'visibility'];
    const rows = data.map((item: any) => {
      return [
        item.name || '',
        item.slug || '',
        item.visibility || 'public',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },
};
