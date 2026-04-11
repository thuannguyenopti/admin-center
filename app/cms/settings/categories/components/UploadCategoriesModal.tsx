import { ImportModal } from '@/app/shared/components/ImportModal/ImportModal';
import { Category, CategoryFormRow, CategoryParsedRow } from '../types';
import { categoryImportConfig } from '../config/categoryImportConfig';

interface UploadCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allCategories: Category[];
  onImport: (toCreate: CategoryFormRow[], toUpdate: CategoryFormRow[]) => void;
}

export function UploadCategoriesModal(props: UploadCategoriesModalProps) {
  return (
    <ImportModal<Category, CategoryFormRow, CategoryParsedRow>
      open={props.open}
      onOpenChange={props.onOpenChange}
      allEntities={props.allCategories}
      onImport={props.onImport}
      config={categoryImportConfig}
    />
  );
}
