import {
  EntityTableButton,
  EntityTableColumnRenderer,
  EntityTableTemplate
} from '@igo2/common/entity';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { skipWhile } from 'rxjs';
import { take } from 'rxjs/operators';

import { RelationOptions, SourceFieldsOptionsParams } from '../../datasource';
import { Feature } from '../../feature/shared';
import { VectorLayer } from '../../layer/shared';
import {
  NewEditionFeature,
  NewEditionWorkspace
} from './new-edition-workspace';

export class EditionWorkspaceTableTemplateFactory {
  // TODO add columns type see EntityTableColumn
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
    workspace
      .entityStore!.entities$.pipe(
        skipWhile((val) => val.length === 0),
        take(1)
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
        workspace.meta!.tableTemplate = {
          selection: false,
          sort: true,
          columns: columnsFromFeatures
        } as EntityTableTemplate;
      });
    return;
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
          const cellClass: Record<string, boolean> = {};
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
    return [
      {
        name: 'edition',
        title: undefined,
        renderer: EntityTableColumnRenderer.ButtonGroup,
        primary: false,
        valueAccessor: (entity: NewEditionFeature) => {
          return [
            {
              editMode: false,
              icon: 'edit',
              color: 'primary',
              disabled:
                layer.dataSource.options.edition!.modifyButton === false
                  ? true
                  : false,
              click: () => {
                workspace.updateFeature(entity);
              }
            } satisfies EntityTableButton<NewEditionFeature>,
            {
              editMode: false,
              icon: 'delete',
              color: 'warn',
              disabled:
                layer.dataSource.options.edition!.deleteButton === false
                  ? true
                  : false,
              click: () => {
                workspace.deleteFeature(entity);
              }
            } satisfies EntityTableButton<NewEditionFeature>,
            {
              editMode: true,
              icon: 'check',
              color: 'primary',
              disabled: workspace.isLoading(),
              click: () => {
                workspace.saveFeature(entity);
              }
            },
            {
              editMode: true,
              icon: 'close',
              color: 'primary',
              disabled: workspace.isLoading(),
              click: () => {
                workspace.cancelEdit(entity);
              }
            }
          ] satisfies EntityTableButton<NewEditionFeature>[];
        }
      }
    ];
  }
}
