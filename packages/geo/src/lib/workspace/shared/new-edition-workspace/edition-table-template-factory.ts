import { EntityTableButton, EntityTableColumnRenderer } from '@igo2/common';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { first, skipWhile } from 'rxjs';

import {
  RelationOptions,
  SourceFieldsOptionsParams
} from '../../../datasource';
import { Feature } from '../../../feature/shared';
import { VectorLayer } from '../../../layer/shared';
import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';

export class EditionWorkspaceTableTemplateFactory {
  addTemplateToWorkspace(workspace: NewEditionWorkspace, layer: VectorLayer) {
    const buttons = this.getButtonTemplate(workspace, layer);

    const fields = layer.dataSource.options.sourceFields;
    if (!fields) {
      return this.createEmptySourceFieldTemplate(workspace);
    }

    const sourceFieldsColumns = this.getSourceFieldsTemplate(fields);

    const relations = layer.dataSource.options.relations ?? [];
    const relationsColumns = this.getRelationsTemplate(relations);

    const columns: unknown[] = sourceFieldsColumns;
    columns.push(...relationsColumns);
    columns.push(...buttons);
    workspace.meta.tableTemplate = {
      selection: false,
      sort: true,
      columns
    };
  }

  private createEmptySourceFieldTemplate(workspace: NewEditionWorkspace) {
    workspace.entityStore.entities$
      .pipe(
        skipWhile((val) => val.length === 0),
        first()
      )
      .subscribe((entities) => {
        const ol = (entities[0] as Feature).ol as olFeature<OlGeometry>;
        const columnsFromFeatures = ol
          .getKeys()
          .filter(
            (col) =>
              !col.startsWith('_') &&
              col !== 'geometry' &&
              col !== ol.getGeometryName() &&
              !col.match(/boundedby/gi)
          )
          .map((key) => {
            return {
              name: `properties.${key}`,
              title: key,
              renderer: EntityTableColumnRenderer.UnsanitizedHTML
            };
          });
        workspace.meta.tableTemplate = {
          selection: false,
          sort: true,
          columns: columnsFromFeatures
        };
      });
  }

  private getRelationsTemplate(relations: RelationOptions[]) {
    return relations.map((relation: RelationOptions) => {
      return {
        name: `properties.${relation.name}`,
        title: relation.alias ? relation.alias : relation.name,
        renderer: EntityTableColumnRenderer.Icon,
        icon: relation.icon,
        parent: relation.parent,
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
      };
    });
  }

  private getSourceFieldsTemplate(fields: SourceFieldsOptionsParams[]) {
    // TODO implement domainValues
    //  if (field.type === 'list' || field.type === 'autocomplete') {

    return fields.map((field) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name,
        renderer: EntityTableColumnRenderer.UnsanitizedHTML,
        valueAccessor: undefined,
        cellClassFunc: () => {
          const cellClass = {};
          if (field.type) {
            cellClass[`class_${field.type}`] = true;
            return cellClass;
          }
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
      };
    });
  }

  private getButtonTemplate(
    workspace: NewEditionWorkspace,
    layer: VectorLayer
  ) {
    const confirmButton = {
      editMode: true,
      icon: 'check',
      color: 'primary',
      disabled: false,
      click: (feature: EditionFeature) => {
        workspace.saveFeature(feature);
      }
    };

    const cancelButton = {
      editMode: true,
      icon: 'alpha-x',
      color: 'primary',
      disabled: false,
      click: (feature: EditionFeature) => {
        workspace.cancelEdit(feature);
      }
    };

    workspace.isLoading$.subscribe((isLoading) => {
      confirmButton.disabled = isLoading;
      cancelButton.disabled = isLoading;
    });

    return [
      {
        name: 'edition',
        title: undefined,
        renderer: EntityTableColumnRenderer.ButtonGroup,
        primary: false,
        valueAccessor: () => {
          return [
            {
              editMode: false,
              icon: 'pencil',
              color: 'primary',
              disabled:
                layer.dataSource.options.edition.modifyButton === false
                  ? true
                  : false,
              click: (feature: EditionFeature) => {
                workspace.editFeature(feature);
              }
            },
            {
              editMode: false,
              icon: 'delete',
              color: 'warn',
              disabled:
                layer.dataSource.options.edition.deleteButton === false
                  ? true
                  : false,
              click: (feature: EditionFeature) => {
                workspace.deleteFeature(feature);
              }
            },
            confirmButton,
            cancelButton
          ] as EntityTableButton[];
        }
      }
    ];
  }
}
