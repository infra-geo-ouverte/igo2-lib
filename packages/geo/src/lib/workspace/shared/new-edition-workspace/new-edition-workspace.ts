import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { EntityRecord, Workspace, WorkspaceOptions } from '@igo2/common';
import { MessageService } from '@igo2/core/message';

import { BehaviorSubject } from 'rxjs';

import { GeometryType } from '../../../draw';
import { Feature, FeatureGeometry } from '../../../feature';
import { ImageLayer, VectorLayer } from '../../../layer/shared';
import { IgoMap } from '../../../map/shared/map';
import { ConfirmationPopupComponent } from '../../confirmation-popup';
import { GeometryEditor } from './geometry-editor';

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

interface BaseEdition {
  feature: EditionFeature;
}

interface UpdateEdition extends BaseEdition {
  type: EditionType.UPDATE;
  featureData: {
    geometry?: FeatureGeometry;
    properties: { [key: string]: any };
  };
}

interface CreationEdition extends BaseEdition {
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

  private edition?: CurrentEdition = undefined;
  private geometryEditor: GeometryEditor;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private messageService: MessageService,
    protected options: EditionWorkspaceOptions
  ) {
    // TODO Add support for geometry edition
    // TODO freeze entity table on move when editing
    // TODO implement domainValues
    // TODO handle relations
    // TODO NEXT implement messages
    super(options);
    this.geometryEditor = new GeometryEditor(this.map, GeometryType.Point);
  }

  abstract getUpdateBody(feature: EditionFeature): Object;
  abstract getCreateBody(feature: EditionFeature): Object;

  updateFeature(feature: EditionFeature) {
    if (this.edition) {
      this.cancelEdit(this.edition.feature);
    }
    this.editFeature(feature, EditionType.UPDATE);
  }

  private editFeature(feature: EditionFeature, type: EditionType) {
    // TODO Domain values
    feature.edition = true;

    this.edition =
      type === EditionType.UPDATE
        ? {
            type: EditionType.UPDATE,
            feature,
            featureData: {
              geometry: feature.geometry,
              properties: JSON.parse(JSON.stringify(feature.properties))
            }
          }
        : { type: EditionType.CREATION, feature };

    if (type === EditionType.CREATION) {
      this.entityStore.insert(feature);
      this.entityStore.state.update(feature, { newFeature: true }, true);
    }

    this.focusEditedFeature(feature);
  }

  createFeature() {
    const feature = {
      type: 'Feature',
      properties: this.initNewFeatureProperties()
    };

    if (this.edition) {
      this.cancelEdit(this.edition.feature);
    }
    this.geometryEditor.enableCreate();
    this.editFeature(feature, EditionType.CREATION);
  }

  private initNewFeatureProperties() {
    const { sourceFields } = this.layer.options.sourceOptions;
    let properties = {};
    sourceFields.forEach((field) => {
      if (!field.primary) {
        properties[field.name] = '';
      }
    });
    return properties;
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
    this.geometryEditor.disable();
  }

  private removeFeature(feature: EditionFeature) {
    const { deleteUrl } = this.layer.dataSource.options.edition;
    const url = this.getFeatureEditionUrl(feature, deleteUrl, 'delete');

    this.isLoadingSubject.next(true);
    this.http.delete(url, {}).subscribe({
      next: () => {
        this.isLoadingSubject.next(false);
        this.refreshLayer();

        this.messageService.success('igo.geo.workspace.deleteSuccess');
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSubject.next(false);
        this.handleEditionError(error);
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
      headers
    }).subscribe(
      () => {
        this.isLoadingSubject.next(false);
        this.closeEdition(feature);
        // TODO ADD SUCCESS MESSAGE
        this.messageService.success('igo.geo.workspace.modifySuccess');
      },
      (error: HttpErrorResponse) => {
        this.isLoadingSubject.next(false);
        this.closeEdition(feature);
        this.handleEditionError(error);
      }
    );
  }

  private saveCreateFeature(feature: EditionFeature) {
    const editionOptions = this.layer.dataSource.options.edition;
    const { addUrl, addHeaders } = editionOptions;

    const url = new URL(addUrl ?? '', this.options.editionUrl).href;
    const headers = new HttpHeaders(addHeaders);

    this.isLoadingSubject.next(true);
    this.http.post(url, this.getCreateBody(feature), { headers }).subscribe({
      next: () => {
        this.isLoadingSubject.next(false);
        this.closeEdition(feature);
        this.refreshLayer();

        this.messageService.success('igo.geo.workspace.addSuccess');
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSubject.next(false);
        this.closeEdition(feature);
        this.handleEditionError(error);
      }
    });
  }

  private handleEditionError(error: HttpErrorResponse) {
    error.error.caught = true;
    this.messageService.error('igo.geo.workspace.addError');
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
