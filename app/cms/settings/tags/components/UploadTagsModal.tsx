import { ImportModal } from '@/app/shared/components/ImportModal/ImportModal';
import { Tag, TagFormRow, TagParsedRow } from '../types';
import { tagImportConfig } from '../config/tagImportConfig';

interface UploadTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: Tag[];
  onImport: (toCreate: TagFormRow[], toUpdate: TagFormRow[]) => void;
}

export function UploadTagsModal(props: UploadTagsModalProps) {
  return (
    <ImportModal<Tag, TagFormRow, TagParsedRow>
      open={props.open}
      onOpenChange={props.onOpenChange}
      allEntities={props.allTags}
      onImport={props.onImport}
      config={tagImportConfig}
    />
  );
}
