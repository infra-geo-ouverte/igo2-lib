import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { EntityRecord, Workspace, WorkspaceOptions } from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

import { Feature, FeatureGeometry } from '../../../feature';
import { ImageLayer, VectorLayer } from '../../../layer/shared';
import { IgoMap } from '../../../map/shared/map';
import { ConfirmationPopupComponent } from '../../confirmation-popup';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
  editionUrl: string;
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
  private isLoadingSubject = new BehaviorSubject(false);
  get isLoading() {
    return this.isLoadingSubject.value;
  }

  get isLoading$() {
    return this.isLoadingSubject.asObservable();
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
    private dialog: MatDialog,
    protected options: EditionWorkspaceOptions
  ) {
    // TODO Add support for geometry edition
    // TODO freeze entity table on move when editing
    // TODO implement domainValues
    // TODO NEXT implement messages
    super(options);
  }

  private edition?: CurrentEdition = undefined;

  abstract getUpdateBody(feature: EditionFeature): Object;
  abstract getCreateBody(feature: EditionFeature): Object;

  updateFeature(feature: EditionFeature) {
    this.editFeature(feature, EditionType.UPDATE);
  }

  private editFeature(feature: EditionFeature, type: EditionType) {
    // TODO Domain values
    feature.edition = true;

    this.edition =
      type === EditionType.UPDATE
        ? {
            type: EditionType.UPDATE,
            featureData: {
              geometry: feature.geometry,
              properties: JSON.parse(JSON.stringify(feature.properties))
            }
          }
        : { type: EditionType.CREATION };

    if (type === EditionType.CREATION) {
      this.entityStore.insert(feature);
      this.entityStore.state.update(feature, { newFeature: true }, true);
    }

    this.focusEditedFeature(feature);
    // TODO handle !id (creation)
  }

  createFeature(feature: EditionFeature) {
    console.log('create feature', feature);
    this.editFeature(feature, EditionType.CREATION);
  }

  deleteFeature(feature: EditionFeature) {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      disableClose: false,
      data: { type: 'delete' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this.removeFeature(feature);
      }
    });
  }

  saveFeature(feature: EditionFeature) {
    const { type } = this.edition;
    switch (type) {
      case EditionType.CREATION:
        return this.saveCreateFeature(feature);
      case EditionType.UPDATE:
        return this.saveUpdateFeature(feature);
    }
  }

  cancelEdit(feature: EditionFeature) {
    if (!this.edition) {
      throw Error("Can't cancel: not editing any feature");
    }

    // TODO check following
    // this.adding$.next(false);
    // workspace.deleteDrawings();

    const { type } = this.edition;
    switch (type) {
      case EditionType.CREATION:
        this.cancelCreation(feature);
        break;
      case EditionType.UPDATE:
        this.cancelUpdate(feature);
        break;
    }

    this.closeEdition(feature);
  }

  private closeEdition(feature: EditionFeature) {
    feature.edition = false;
    this.entityStore.stateView.clear();
    this.edition = undefined;
  }

  private removeFeature(feature: EditionFeature) {
    const { deleteUrl } = this.layer.dataSource.options.edition;
    const url = this.getFeatureEditionUrl(feature, deleteUrl, 'delete');

    this.isLoadingSubject.next(true);
    this.http.delete(url, {}).subscribe({
      next: () => {
        this.isLoadingSubject.next(false);
        this.refreshLayer();
        // TODO handle relations
        // this.messageService.success('igo.geo.workspace.deleteSuccess');
      },
      error: () => {
        this.isLoadingSubject.next(false);
        // TODO handle error: add custom message etc
      }
    });
  }

  private refreshLayer() {
    const olLayer = this.layer.dataSource.ol;
    olLayer.refresh();
  }

  private getFeatureEditionUrl(
    feature: EditionFeature,
    methodUrl: string | undefined,
    method: string
  ) {
    const baseUrl = methodUrl ?? '';
    const featUrl =
      method !== 'post' ? baseUrl + this.getFeatureId(feature) : baseUrl;
    return new URL(featUrl, this.options.editionUrl).href;
  }

  private saveUpdateFeature(feature: EditionFeature) {
    console.log('update feature');
    const editionOptions = this.layer.dataSource.options.edition;
    const { modifyUrl, modifyMethod, modifyHeaders } = editionOptions;

    const url = this.getFeatureEditionUrl(feature, modifyUrl, modifyMethod);

    const headers = new HttpHeaders(modifyHeaders);

    this.isLoadingSubject.next(true);
    this.http[modifyMethod ?? 'patch'](url, this.getUpdateBody(feature), {
      headers: headers
    }).subscribe(
      () => {
        this.isLoadingSubject.next(false);
        this.closeEdition(feature);
      },
      () => {
        this.isLoadingSubject.next(false);
      }
    );
  }

  private saveCreateFeature(feature: EditionFeature) {
    console.log('Save creation feature');
  }

  private cancelCreation(feature: EditionFeature) {
    if (this.edition.type !== EditionType.CREATION) {
      throw Error("Can't cancel creation current edition is not creation");
    }
    this.entityStore.delete(feature);
    // TODO CHECK this.rowsInMapExtentCheckCondition$.next(true);
  }

  private cancelUpdate(feature: EditionFeature) {
    if (this.edition.type !== EditionType.UPDATE) {
      throw Error("Can't cancel update current edition is not update");
    }

    const { featureData } = this.edition;

    feature.properties = featureData.properties;
    feature.geometry = featureData.geometry;

    this.edition = undefined;
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
      throw Error('No primary keys in feature');
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
