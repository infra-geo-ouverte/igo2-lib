import {
  EntityTableButton,
  EntityTableColumn,
  EntityTableColumnRenderer,
  EntityTableTemplate
} from 'packages/common/entity/src/shared';

import {
  RelationOptions,
  SourceFieldsOptionsParams
} from '../../datasource/shared';
import { Feature } from '../../feature/shared';
import { EditionTableActions } from './edition-table-actions';

export interface TableTemplateInput {
  fields: SourceFieldsOptionsParams[];
  relations: RelationOptions[];
  actions: EditionTableActions;
}

export class EditionTableTemplateComposer {
  compose(input: TableTemplateInput): EntityTableTemplate {
    return {
      selection: false,
      sort: true,
      columns: [
        ...this.sourceColumns(input.fields),
        ...this.relationColumns(input.relations),
        this.actionColumn(input.actions)
      ]
    };
  }
  private sourceColumns(
    fields: SourceFieldsOptionsParams[]
  ): EntityTableColumn[] {
    // TODO implement domainValues
    //  if (field.type === 'list' || field.type === 'autocomplete') {
    return fields.map(
      (field) =>
        ({
          name: `properties.${field.name}`,
          title: field.alias ? field.alias : field.name,
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: undefined,
          cellClassFunc: () => {
            const cellClass: Record<string, boolean> = {};

            if (field.type) {
              cellClass[`class_${field.type}`] = true;
            }

            return cellClass;
          },
          primary: field.primary === true ? true : false,
          visible: field.visible,
          validation: field.validation,
          linkColumnForce: field.linkColumnForce,
          type: field.type,
          domainValues: undefined,
          relation: undefined,
          multiple: field.multiple,
          step: field.step,
          tooltip: field.tooltip
        }) satisfies EntityTableColumn
    );
  }

  private relationColumns(relations: RelationOptions[]): EntityTableColumn[] {
    return relations.map(
      (relation: RelationOptions) =>
        ({
          name: `properties.${relation.name}`,
          title: relation.alias ? relation.alias : relation.name,
          renderer: EntityTableColumnRenderer.Icon,
          icon: relation.icon,
          //   parent: relation.parent, // TODO ?
          type: 'relation',
          tooltip: relation.tooltip,
          onClick: () => {
            throw Error('Not yet implemented');
            // if (this.adding$.getValue() === false) {
            //   this.ws$.next(relation.title);
            // }
          },
          cellClassFunc: () => {
            return { class_icon: true };
          }
        }) satisfies EntityTableColumn
    );
  }

  private actionColumn(actions: EditionTableActions): EntityTableColumn {
    return {
      name: 'edition',
      title: '',
      renderer: EntityTableColumnRenderer.ButtonGroup,
      primary: false,
      valueAccessor: (entity) => {
        const feature = entity as Feature;
        return [
          {
            icon: 'edit',
            color: 'primary',
            disabled: !actions.canModify(),
            visible: (e) => !actions.isEditing(e as Feature),
            click: () => actions.onEdit(feature)
          } satisfies EntityTableButton<Feature>,
          {
            icon: 'delete',
            color: 'warn',
            disabled: !actions.canDelete(),
            visible: (e) => !actions.isEditing(e as Feature),
            click: () => actions.onDelete(feature)
          } satisfies EntityTableButton<Feature>,
          {
            icon: 'check',
            color: 'primary',
            disabled: actions.isBusy(),
            visible: (e) => actions.isEditing(e as Feature),
            click: () => actions.onSave(feature)
          },
          {
            icon: 'close',
            color: 'primary',
            disabled: actions.isBusy(),
            visible: (e) => actions.isEditing(e as Feature),
            click: () => actions.onCancel(feature)
          }
        ] satisfies EntityTableButton<Feature>[];
      }
    } satisfies EntityTableColumn;
  }
}
