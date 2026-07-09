import { ImportConfig } from '@/app/shared/components/ImportModal/types';
import { Category, CategoryFormRow, CategoryParsedRow, OrphanedCategory, ParsedCSVRow } from '../types';
import {
  parseCategoriesCSV,
  detectOrphans,
  convertJsonToCsv,
} from '../utils';
import { Text } from '@/app/components/Text';
import { Badge, Group, Select, SelectTrigger, SelectContent, Button, Box } from '@optiaxiom/react';
import {IconChevronDown, IconChevronUp} from "@/app/lib/axiom-icons";
import { useState } from 'react';

// Component for collapsible orphan details
function OrphanDetails({ orphans }: { orphans: OrphanedCategory[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Group flexDirection="column" gap="8">
      <Group alignItems="center" justifyContent="space-between" w="full">
        <Text fontSize="xs" color="fg.secondary" style={{ flex: 1 }}>
          Will skip {orphans.length} {orphans.length === 1 ? 'category' : 'categories'} unless parent action is <Text asChild fontWeight="600"><span>Update</span></Text> or <Text asChild fontWeight="600"><span>Create new</span></Text>.
        </Text>
        <Button
          appearance="subtle"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ flexShrink: 0 }}
        >
          <Group gap="4" alignItems="center">
            {isExpanded ? (
              <>
                <Text fontSize="xs">Hide</Text>
                <IconChevronUp size={16} />
              </>
            ) : (
              <>
                <Text fontSize="xs">Show details</Text>
                <IconChevronDown size={16} />
              </>
            )}
          </Group>
        </Button>
      </Group>

      {isExpanded && (
        <Box pl="12" pt="4">
          <Group flexDirection="column" gap="6">
            {orphans.map((orphan: OrphanedCategory, index: number) => (
              <Group key={`orphan-${index}-${orphan.slug}`} gap="6" alignItems="start">
                <Text fontSize="xs" color="fg.tertiary" fontFamily="mono" style={{ minWidth: '20px' }}>
                  {index + 1}.
                </Text>
                <Group flexDirection="column" gap="0">
                  <Text fontSize="sm" fontWeight="500" color="fg.default">
                    {orphan.name}
                  </Text>
                  <Text fontSize="xs" color="fg.tertiary">
                    Parent: {orphan.parentSlug}
                  </Text>
                </Group>
              </Group>
            ))}
          </Group>
        </Box>
      )}
    </Group>
  );
}

export const categoryImportConfig: ImportConfig<Category, CategoryFormRow, CategoryParsedRow> = {
  entityName: 'category',
  entityNamePlural: 'categories',

  csvHeaders: ['name', 'slug', 'parentSlug', 'status', 'visibility'],

  templateData: `name,slug,parentSlug,status,visibility
Sports,sports,,published,public
Cycling,cycling,sports,published,public
Road Bikes,road-bikes,cycling,published,public
Equipment,equipment,,draft,private`,

  parseCSV: async (file: File, existingCategories: Category[]) => {
    const result = await parseCategoriesCSV(file, existingCategories);
    // Adapt the result to use existingCategory instead of existingEntity
    return {
      rows: result.rows.map(row => ({
        ...row,
        existingEntity: (row as ParsedCSVRow).existingCategory,
        existingCategory: (row as ParsedCSVRow).existingCategory,
      })) as CategoryParsedRow[],
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
      width: '150px',
      render: (row) => row.name,
    },
    {
      key: 'slug',
      label: 'Slug',
      width: '130px',
      render: (row) => (
        <Text fontSize="sm" fontFamily="mono" color="fg.secondary">
          /{row.slug}
        </Text>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
      width: '110px',
      render: (row, _originalIndex, allCategories) => {
        const getParentName = (parentSlug: string | null): string => {
          if (!parentSlug) return '(None)';
          const parent = allCategories.find((c) => c.slug === parentSlug);
          if (parent) return parent.name;
          const csvParent = (row as any).parsedRows?.find((r: any) => r.slug === parentSlug);
          if (csvParent) return csvParent.name;
          return parentSlug;
        };

        return (
          <Text fontSize="sm" color="fg.secondary">
            {getParentName(row.parentSlug)}
          </Text>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '90px',
      render: (row) => (
        <Text fontSize="sm" style={{ textTransform: 'capitalize' }}>
          {row.categoryStatus}
        </Text>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      width: '90px',
      render: (row) => (
        <Text fontSize="sm" style={{ textTransform: 'capitalize' }}>
          {row.visibility}
        </Text>
      ),
    },
    {
      key: 'importStatus',
      label: 'Import Status',
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
      width: '300px',
      render: (row, _originalIndex, _allCategories, resolutions, handleResolutionChange) => {
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
              {row.existingCategory && (
                <Text fontSize="xs" color="fg.secondary">
                  Existing category: {row.existingCategory.name} • {row.existingCategory.visibility}
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

  transformToFormRow: (row, resolution, allCategories = []) => {
    // Skip errors and duplicates
    if (row.status === 'error' || row.status === 'duplicate-in-csv') {
      return null;
    }

    // Skip if conflict resolution says to skip
    if (resolution?.action === 'skip') {
      return null;
    }

    // Handle valid rows (new categories)
    if (row.status === 'valid') {
      return {
        name: row.name,
        slug: row.slug,
        parentId: row.parentSlug ? `PENDING:${row.parentSlug}` : null,
        visibility: row.visibility,
      };
    }

    // Handle existing categories with conflict resolution
    if (row.status === 'exists-in-system') {
      if (resolution?.action === 'update' && row.existingCategory) {
        // For updates, resolve parent ID immediately
        let parentId: string | null = null;
        if (row.parentSlug) {
          const parentInSystem = allCategories.find(c => c.slug === row.parentSlug);
          parentId = parentInSystem ? parentInSystem.id : null;
        }

        return {
          id: row.existingCategory.id,
          name: row.name,
          slug: row.slug,
          parentId,
          visibility: row.visibility,
        };
      }

      if (resolution?.action === 'create-new' && resolution.newSlug) {
        return {
          name: row.name,
          slug: resolution.newSlug,
          parentId: row.parentSlug ? `PENDING:${row.parentSlug}` : null,
          visibility: row.visibility,
        };
      }
    }

    return null;
  },

  // Sort categories for dependency order (parents before children)
  sortForImport: (rows, resolutions) => {
    // Filter out errors, duplicates, and skipped conflicts
    const validRows = rows.filter(row => {
      if (row.status === 'error' || row.status === 'duplicate-in-csv') return false;
      if (row.status === 'exists-in-system') {
        const resolution = resolutions.get(row.slug);
        return resolution?.action !== 'skip';
      }
      return true;
    });

    // Build dependency map: child -> parent
    const dependencyMap = new Map<string, string | null>();
    validRows.forEach((row) => {
      dependencyMap.set(row.slug, row.parentSlug);
    });

    // Topological sort (level-by-level)
    const sorted: CategoryParsedRow[] = [];
    const processed = new Set<string>();
    let remaining = [...validRows];

    // Keep processing until all are sorted or we can't make progress
    while (remaining.length > 0) {
      const beforeLength = remaining.length;

      // Find items whose parents are either processed or don't exist
      const canProcess = remaining.filter((row) => {
        if (!row.parentSlug) return true; // Root level
        return processed.has(row.parentSlug); // Parent already processed
      });

      canProcess.forEach((row) => {
        sorted.push(row);
        processed.add(row.slug);
      });

      remaining = remaining.filter((row) => !processed.has(row.slug));

      // If we didn't make progress, we have a circular dependency or missing parent
      // Add remaining items anyway (they'll be orphaned)
      if (remaining.length === beforeLength && remaining.length > 0) {
        remaining.forEach((row) => {
          sorted.push(row);
          processed.add(row.slug);
        });
        break;
      }
    }

    return sorted;
  },

  // Detect orphaned categories
  detectWarnings: (rows, resolutions, allCategories) => {
    const orphans = detectOrphans(rows as ParsedCSVRow[], resolutions, allCategories);

    if (orphans.length === 0) return [];

    return [{
      type: 'orphan' as const,
      severity: 'warning' as const,
      title: `${orphans.length} ${orphans.length === 1 ? 'category is' : 'categories are'} missing a parent`,
      message: '',
      affectedRows: orphans.map(o => o.slug),
      details: <OrphanDetails orphans={orphans} />,
    }];
  },

  convertJsonToCsv,
};
