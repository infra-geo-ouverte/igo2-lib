import { Feature } from '../../feature';
import { VectorLayer } from '../../layer';
import { NewEditionWorkspace } from './new-edition-workspace';

export interface EditionTableActions {
  onEdit(entity: Feature): void;
  onDelete(entity: Feature): void;
  onSave(entity: Feature): void;
  onCancel(entity: Feature): void;
  isBusy(): boolean;
  canModify(): boolean;
  canDelete(): boolean;
}

export function createEditionTableActions(
  workspace: NewEditionWorkspace
): EditionTableActions {
  const edition = layer.dataSource.options.edition;
  return {
    onEdit: (e) => workspace.updateFeature(e),
    onDelete: (e) => workspace.deleteFeature(e),
    onSave: (e) => workspace.saveFeature(e),
    onCancel: (e) => workspace.cancelEdit(e),
    isBusy: () => workspace.isLoading(),
    canModify: () => edition?.modifyButton !== false,
    canDelete: () => edition?.deleteButton !== false
  };
}
