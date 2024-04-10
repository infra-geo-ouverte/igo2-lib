import { EntityTableButton, EntityTableColumnRenderer } from '@igo2/common';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { first, skipWhile } from 'rxjs';

import { Feature } from '../../../feature/shared';
import { VectorLayer } from '../../../layer/shared';
import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';

export class EditionWorkspaceTableTemplateFactory {
  createWFSTemplate(workspace: NewEditionWorkspace, layer: VectorLayer) {
    const buttons = this.createButtonTemplate(workspace, layer);
    // TODO add all validation from EditionWorkspaceService
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
              renderer: EntityTableColumnRenderer.UnsanitizedHTML,
              primary: key === 'id' // TODO use workspace.getPrimaryPropName
            };
          });

        const columns = columnsFromFeatures;
        columns.push(...buttons);
        workspace.meta.tableTemplate = {
          selection: false,
          sort: true,
          columns
        };
      });
  }

  private createButtonTemplate(
    workspace: NewEditionWorkspace,
    layer: VectorLayer
  ) {
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
            {
              editMode: true,
              icon: 'check',
              color: 'primary',
              disabled: workspace.isLoading,
              click: (feature: EditionFeature) => {
                workspace.saveFeature(feature);
              }
            },
            {
              editMode: true,
              icon: 'alpha-x',
              color: 'primary',
              disabled: workspace.isLoading,
              click: (feature: EditionFeature) => {
                workspace.cancelEdit(feature);
              }
            }
          ] as EntityTableButton[];
        }
      }
    ];
  }
}
