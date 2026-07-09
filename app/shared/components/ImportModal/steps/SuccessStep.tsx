import {
  DialogHeader,
  DialogBody,
  DialogFooter,
  Group,
  Button,
} from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import {IconCheck} from "@/app/lib/axiom-icons";
import { UploadStats, BaseEntity, BaseFormRow, BaseParsedRow, ImportConfig } from '../types';

interface SuccessStepProps<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
> {
  config: ImportConfig<TEntity, TFormRow, TParsedRow>;
  uploadStats: UploadStats;
  onClose: () => void;
}

export function SuccessStep<
  TEntity extends BaseEntity,
  TFormRow extends BaseFormRow,
  TParsedRow extends BaseParsedRow<TEntity>
>({
  config,
  uploadStats,
  onClose,
}: SuccessStepProps<TEntity, TFormRow, TParsedRow>) {
  return (
    <>
      <DialogHeader>
        <Text fontSize="xl" fontWeight="600">
          Import Complete
        </Text>
      </DialogHeader>
      <DialogBody>
        <Group flexDirection="column" alignItems="center" gap="24" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <IconCheck size={64} style={{ color: 'var(--ax-colors-fg-success)' }} />
          <Group flexDirection="column" alignItems="center" gap="12">
            <Text fontSize="lg" fontWeight="600">
              Your {config.entityNamePlural} have been imported successfully
            </Text>
            <Group flexDirection="column" alignItems="center" gap="4">
              {(uploadStats?.created || 0) > 0 && (
                <Text fontSize="md" color="fg.secondary">
                  {uploadStats.created} new {uploadStats.created === 1 ? config.entityName : config.entityNamePlural} created
                </Text>
              )}
              {(uploadStats?.updated || 0) > 0 && (
                <Text fontSize="md" color="fg.secondary">
                  {uploadStats.updated} existing {uploadStats.updated === 1 ? config.entityName : config.entityNamePlural} updated
                </Text>
              )}
              {(uploadStats?.skipped || 0) > 0 && (
                <Text fontSize="md" color="fg.secondary">
                  {uploadStats.skipped} {uploadStats.skipped === 1 ? config.entityName : config.entityNamePlural} skipped
                </Text>
              )}
            </Group>
          </Group>
        </Group>
      </DialogBody>
      <DialogFooter>
        <Group justifyContent="flex-end" w="full">
          <Button appearance="primary" size="lg" onClick={onClose}>
            Done
          </Button>
        </Group>
      </DialogFooter>
    </>
  );
}
