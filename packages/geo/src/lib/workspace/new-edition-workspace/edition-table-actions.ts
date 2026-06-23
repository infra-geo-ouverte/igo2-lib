import { Feature } from '../../feature';
import { NewEditionWorkspace } from './new-edition-workspace';

export interface EditionTableActions {
  onEdit(entity: Feature): void;
  onDelete(entity: Feature): void;
  onSave(entity: Feature): void;
  onCancel(entity: Feature): void;
  isBusy(): boolean;
  canModify(): boolean;
  canDelete(): boolean;
  isEditing(entity: Feature): boolean;
}

export function createEditionTableActions(
  workspace: NewEditionWorkspace
): EditionTableActions {
  return {
    onEdit: (e) => workspace.editFeature(e),
    onDelete: (e) => workspace.deleteFeature(e),
    onSave: (e) => workspace.saveFeature(e),
    onCancel: (e) => workspace.cancelEdit(e),
    isBusy: () => workspace.isLoading(),
    canModify: () => workspace.canEdit(),
    canDelete: () => workspace.canDelete,
    isEditing: (e) => workspace.isEditing(e)
  };
}
