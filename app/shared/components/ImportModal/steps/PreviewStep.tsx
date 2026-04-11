import {
  DialogHeader,
  DialogBody,
  DialogFooter,
  Box,
  Group,
  Button,
  Badge,
  Pagination,
  Select,
  SelectTrigger,
  SelectContent,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { Table, Tr, Th, Td } from '@/app/components/Table';
import {
  BaseEntity,
  BaseFormRow,
  BaseParsedRow,
  ImportConfig,
  ParseStats,
  ConflictResolution,
  ImportWarning,
  PaginationProps,
  ConflictHandlers,
} from '../types';
import { useRef, useState } from 'react';

interface PreviewStepProps<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
> {
  config: ImportConfig<TEntity, TFormRow, TParsedRow>;
  parsedRows: TParsedRow[];
  parseStats: ParseStats;
  resolutions: Map<string, ConflictResolution>;
  warnings: ImportWarning[];
  pagination: PaginationProps;
  conflictHandlers: ConflictHandlers;
  allEntities: TEntity[];
  onBack: () => void;
  onImport: () => void;
}

export function PreviewStep<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
>({
  config,
  parsedRows,
  parseStats,
  resolutions,
  warnings,
  pagination,
  conflictHandlers,
  allEntities,
  onBack,
  onImport,
}: PreviewStepProps<TEntity, TFormRow, TParsedRow>) {
  const dialogBodyRef = useRef<HTMLDivElement>(null);
  const [expandedSection, setExpandedSection] = useState<'errors' | 'conflicts' | string | null>(null);

  const errorRows = parsedRows.filter((r) => r.status === 'error');
  const conflictRowsFiltered = parsedRows.filter((r) => r.status === 'exists-in-system');

  const { currentPage, totalPages, currentPageData, setCurrentPage, itemsPerPage } = pagination;
  const { handleResolutionChange, handleBulkResolution, defaultResolution } = conflictHandlers;

  const startIndex = (currentPage - 1) * itemsPerPage;

  const toggleSection = (section: 'errors' | 'conflicts' | 'duplicates' | string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <>
      <DialogHeader>
        <Text fontSize="xl" fontWeight="600">
          Preview import ({parsedRows.length})
        </Text>
      </DialogHeader>
      <DialogBody
        ref={dialogBodyRef}
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: '16px', width: '100%' }}
      >
        <Group flexDirection="column" gap="16" style={{ minWidth: 0, width: '100%', maxWidth: '100%', flex: 1, minHeight: 0, display: 'flex' }}>
          {/* Summary stats - clickable badge layout */}
          <Group flexDirection="column" gap="12">
            <Group gap="8" alignItems="center" flexWrap="wrap">
              <Text fontSize="sm" color="fg.secondary">
                Found {parsedRows.length} {parsedRows.length === 1 ? config.entityName : config.entityNamePlural}:
              </Text>
              <Group gap="4" alignItems="center">
                {parseStats?.valid > 0 && (
                  <Badge intent="success">{parseStats.valid} ready</Badge>
                )}
                {errorRows.length > 0 && (
                  <Badge
                    intent="danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSection('errors')}
                  >
                    {errorRows.length} {errorRows.length === 1 ? 'error' : 'errors'}
                  </Badge>
                )}
                {conflictRowsFiltered.length > 0 && (
                  <Badge
                    intent="warning"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSection('conflicts')}
                  >
                    {conflictRowsFiltered.length} {conflictRowsFiltered.length === 1 ? 'conflict' : 'conflicts'}
                  </Badge>
                )}
                {warnings.map((warning, idx) => (
                  <Badge
                    key={idx}
                    intent="warning"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSection(`warning-${idx}`)}
                  >
                    {warning.title}
                  </Badge>
                ))}
              </Group>
            </Group>

            {/* Only show one expanded section at a time */}
            {expandedSection === 'errors' && errorRows.length > 0 && (
              <Group flexDirection="column" gap="4" bg="bg.error.subtle" p="12" rounded="sm">
                {errorRows.slice(0, 5).map((row, idx) => (
                  <Text key={idx} fontSize="xs" color="fg.error">
                    Row {row.rowNumber}: {row.error}
                  </Text>
                ))}
                {errorRows.length > 5 && (
                  <Text fontSize="xs" color="fg.secondary">
                    + {errorRows.length - 5} more errors
                  </Text>
                )}
              </Group>
            )}

            {expandedSection === 'conflicts' && conflictRowsFiltered.length > 0 && (
              <Group flexDirection="column" gap="8" bg="bg.warning.subtle" p="12" rounded="sm">
                <Group alignItems="center" justifyContent="space-between" w="full">
                  <Text fontSize="xs" color="fg.secondary">
                    These items already exist. Choose how to handle them:
                  </Text>
                  <Group alignItems="center" gap="8">
                    <Text fontSize="xs" fontWeight="600" color="fg.default">
                      Bulk action:
                    </Text>
                    <Select
                      value={defaultResolution}
                      onValueChange={(value) => handleBulkResolution(value as 'skip' | 'update' | 'create-new' | 'manual')}
                      options={[
                        { label: 'Skip all', value: 'skip' },
                        { label: 'Update all', value: 'update' },
                        { label: 'Create new for all', value: 'create-new' },
                        { label: 'Manual', value: 'manual' },
                      ]}
                    >
                      <SelectTrigger size="sm" style={{ minWidth: '120px' }}>
                        {defaultResolution === 'skip' && 'Skip all'}
                        {defaultResolution === 'update' && 'Update all'}
                        {defaultResolution === 'create-new' && 'Create new for all'}
                        {defaultResolution === 'manual' && 'Manual'}
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                  </Group>
                </Group>
                <Group flexDirection="column" gap="4">
                  {conflictRowsFiltered.slice(0, 5).map((row, idx) => (
                    <Text key={idx} fontSize="xs" color="fg.secondary">
                      Row {row.rowNumber}: "{row.name}" (slug: {row.slug})
                    </Text>
                  ))}
                  {conflictRowsFiltered.length > 5 && (
                    <Text fontSize="xs" color="fg.secondary">
                      + {conflictRowsFiltered.length - 5} more conflicts
                    </Text>
                  )}
                </Group>
              </Group>
            )}

            {warnings.map((warning, idx: number) =>
              expandedSection === `warning-${idx}` && (
                <Group key={idx} flexDirection="column" gap="8" bg="bg.warning.subtle" p="12" rounded="sm">
                  {warning.message && (
                    <Text fontSize="xs" color="fg.secondary">
                      {warning.message}
                    </Text>
                  )}
                  {warning.details}
                </Group>
              )
            )}
          </Group>

          {/* Scrollable table container - only the table scrolls vertically */}
          <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            <Box style={{ overflowX: 'auto', minWidth: 0 }}>
              <Table>
                <thead>
                  <Tr>
                    {config.tableColumns.map((column) => (
                      <Th key={column.key} style={{ width: column.width }}>
                        {column.label}
                      </Th>
                    ))}
                  </Tr>
                </thead>
                <tbody>
                  {currentPageData.map((row, index) => {
                    const originalIndex = startIndex + index;

                    const bgColor =
                      row.status === 'error'
                        ? 'var(--ax-colors-bg-error-subtlest)'
                        : row.status === 'duplicate-in-csv'
                          ? 'var(--ax-colors-bg-information-subtlest)'
                          : row.status === 'exists-in-system'
                            ? 'var(--ax-colors-bg-warning-subtlest)'
                            : 'transparent';

                    return (
                      <Tr
                        key={index}
                        data-row-index={originalIndex}
                        style={{
                          backgroundColor: bgColor,
                          position: 'relative',
                          transition: 'background-color 0.2s ease-in-out',
                        }}
                      >
                        {config.tableColumns.map((column) => {
                          // Check if column should be visible for this row
                          if (column.visible && !column.visible(row)) {
                            return null;
                          }

                          return (
                            <Td key={column.key} style={{ width: column.width, verticalAlign: 'middle' }}>
                              {column.render(row, originalIndex, allEntities, resolutions, handleResolutionChange)}
                            </Td>
                          );
                        })}
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </Box>

            {/* Pagination Controls - directly beneath table */}
            {totalPages > 1 && (
              <Group alignItems="center" justifyContent="space-between" gap="16" p="12" bg="bg.default">
                <Text fontSize="sm" color="fg.secondary">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, parsedRows.length)} of {parsedRows.length}
                </Text>
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onPageChange={setCurrentPage}
                />
              </Group>
            )}
          </Box>
        </Group>
      </DialogBody>
      <DialogFooter>
        <Group gap="16" justifyContent="flex-end" w="full">
          <Button appearance="default" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button
            appearance="primary"
            size="lg"
            onClick={onImport}
            disabled={parseStats?.valid === 0 && conflictRowsFiltered.length === 0}
          >
            Import {config.entityNamePlural}
          </Button>
        </Group>
      </DialogFooter>
    </>
  );
}
