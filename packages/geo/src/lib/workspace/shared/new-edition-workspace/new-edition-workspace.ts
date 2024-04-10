import { HttpClient } from '@angular/common/http';

import { EntityRecord, Workspace, WorkspaceOptions } from '@igo2/common';

import { Feature, FeatureGeometry } from '../../../feature';
import { ImageLayer, VectorLayer } from '../../../layer/shared';
import { IgoMap } from '../../../map/shared/map';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export interface EditionFeature extends Feature {
  edition?: boolean;
}

enum EditionType {
  CREATION,
  UPDATE
}

interface UpdateEdition {
  type: EditionType.UPDATE;
  featureData: {
    geometry?: FeatureGeometry;
    properties: { [key: string]: any };
  };
}

interface CreationEdition {
  type: EditionType.CREATION;
}

type CurrentEdition = UpdateEdition | CreationEdition;

export abstract class NewEditionWorkspace extends Workspace {
  // TODO !!IMPORTANT!! rename to EditionWorkspace
  private isLoadingVal = false;
  get isLoading() {
    return this.isLoadingVal;
  }

  get layer(): ImageLayer | VectorLayer {
    return this.options.layer;
  }

  get map(): IgoMap {
    return this.options.map;
  }

  get inResolutionRange$() {
    return this.layer.isInResolutionsRange$;
  }

  constructor(
    private http: HttpClient,
    protected options: EditionWorkspaceOptions
  ) {
    // TODO Add support for geometry edition
    // TODO freeze entity table on move when editing
    super(options);
  }

  private edition?: CurrentEdition = undefined;

  abstract getUpdateBody(): Object;
  abstract getCreateBody(): Object;

  createFeature(feature: Feature) {
    throw Error('Not yet implemented');
  }

  editFeature(feature: EditionFeature) {
    // TODO Domain values
    feature.edition = true;
    const id = this.getFeatureId(feature);

    this.edition = id
      ? {
          type: EditionType.UPDATE,
          featureData: {
            geometry: feature.geometry,
            properties: JSON.parse(JSON.stringify(feature.properties))
          }
        }
      : { type: EditionType.CREATION };

    this.focusEditedFeature(feature);
    // TODO handle !id (creation)
  }

  deleteFeature(feature: EditionFeature) {
    throw Error('Not yet implemented');
  }

  saveFeature(feature: EditionFeature) {
    throw Error('Not yet implemented');
  }

  cancelEdit(feature: EditionFeature) {
    throw Error('Not yet implemented');
  }

  private focusEditedFeature(feature: EditionFeature) {
    this.entityStore.state.updateAll({ edit: false });
    this.entityStore.stateView.filter(
      (record: EntityRecord<object>) => !!record.state.edit
    );

    this.entityStore.state.update(feature, { edit: true }, true);
  }

  private addFeatureToStore(feature: EditionFeature) {
    // TODO implement add geometry feature
  }

  private getFeatureId(feature: EditionFeature) {
    const columns: { primary?: boolean; name: string }[] =
      this.meta.tableTemplate.columns;

    const primaryColumn = columns.find((column) => column.primary);
    if (!primaryColumn) {
      return undefined; // TODO should return Error cannot edit if no primary
    }

    const { name: primaryColumnName } = primaryColumn;
    const propertyName = primaryColumnName.includes('properties.')
      ? primaryColumnName.split('.')[1]
      : primaryColumnName;

    const primaryProperty = Object.keys(feature.properties).find(
      (property) => property === propertyName
    );

    return primaryProperty ? feature.properties[primaryProperty] : undefined;
  }
}
