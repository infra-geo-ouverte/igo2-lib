import {
  // HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpRequest
} from '@angular/common/http';
import { Signal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityRecord } from '@igo2/common/entity';
import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
import { MessageService } from '@igo2/core/message';

import { GeometryType } from '../../draw';
import { Feature, FeatureGeometry } from '../../feature';
import { ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import { ConfirmationPopupComponent } from '../confirmation-popup';
import { GeometryEditor } from './geometry-editor';
import { EditionOverlay } from './rendering/edition-overlay';
import { EditionSession } from './session/edition-session';
import { EditionStrategy } from './strategy/edition-strategy';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
  editionUrl: string;
}

export interface NewEditionFeature extends Feature {
  edition?: boolean;
}

enum EditionType {
  CREATION,
  UPDATE
}

interface BaseEdition {
  feature: NewEditionFeature;
}

interface UpdateEdition extends BaseEdition {
  type: EditionType.UPDATE;
  featureData: {
    geometry?: FeatureGeometry;
    properties: Record<string, unknown>;
  };
}

interface CreationEdition extends BaseEdition {
  type: EditionType.CREATION;
}

type CurrentEdition = UpdateEdition | CreationEdition;

export class NewEditionWorkspace extends Workspace {
  // TODO !!IMPORTANT!! rename to EditionWorkspace
  readonly isLoading: Signal<boolean>;

  private readonly _isLoading = signal(false);
  private edition?: CurrentEdition = undefined;
  private geometryEditor: GeometryEditor;

  private editionSession: EditionSession | undefined;

  constructor(
    private strategy: EditionStrategy,
    private overlay: EditionOverlay,
    private dialog: MatDialog,
    private messageService: MessageService,
    protected options: EditionWorkspaceOptions
    // private http: HttpClient,
  ) {
    // TODO Add support for geometry edition
    // TODO freeze entity table on move when editing
    // TODO implement domainValues
    // TODO handle relations
    // TODO NEXT implement messages
    super(options);
    this.isLoading = this._isLoading.asReadonly();
    this.geometryEditor = new GeometryEditor(this.map, GeometryType.Point);
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

  canEdit(): boolean {
    // todo
    return true;
  }

  createFeature() {
    const feature = {
      type: 'Feature',
      properties: this.initNewFeatureProperties()
    };

    if (this.edition) {
      this.cancelEdit(this.edition.feature);
    }
    this.geometryEditor.enableCreate(feature);
    this.editFeature(feature, EditionType.CREATION);
  }

  deleteFeature(feature: Feature) {
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

  saveFeature(feature: Feature) {
    if (!this.editionSession)
      throw Error("Can't save feature: not editing any feature"); // todo:

    switch (this.editionSession?.mode) {
      case 'create':
        this.strategy.create(feature);
        // this.saveCreateFeature(feature);
        break;
      case 'modify':
        this.strategy.update(feature);
        this.saveUpdateFeature(feature);
        break;
      default: {
        const _exhaustiveCheck: never = this.editionSession?.mode;
        throw Error(`Unknown edition mode: ${_exhaustiveCheck}`);
      }
    }
  }

  updateFeature(feature: Feature) {
    if (!this.canEdit()) {
      // todo
      throw Error('Not implemented yet');
    }

    this.editionSession = new EditionSession('modify');
    const featureEdition = this.editionSession.add(feature);

    //tryCatch
    this.overlay.showGhost(featureEdition.snapshot);
    this.overlay.enableModify(featureEdition.feature);

    // if (this.edition) {
    //   this.cancelEdit(this.edition.feature);
    // }

    // this.editFeature(feature, EditionType.UPDATE);

    // this.geometryEditor.enableEdit(feature);
    // TODO remove edited feature from layer and add it back if cancel
  }

  cancelEdit(feature: Feature) {
    if (!this.edition) {
      throw Error("Can't cancel: not editing any feature");
    }

    // TODO check following
    // this.adding$.next(false);
    // workspace.deleteDrawings();
    switch (this.edition?.type) {
      case EditionType.CREATION:
        this.cancelCreation(feature);
        break;
      case EditionType.UPDATE:
        this.cancelUpdate(feature);
        break;
    }

    this.closeEdition(feature);
  }

  private getFeatureId(feature: NewEditionFeature) {
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

  private editFeature(feature: NewEditionFeature, type: EditionType) {
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
      this.entityStore!.insert(feature);
    }

    this.focusEditedFeature(feature);
  }

  private removeFeature(feature: NewEditionFeature) {
    this._isLoading.set(true);
    this.strategy.delete(feature).subscribe({
      next: () => {
        this._isLoading.set(false);
        this.refreshLayer();
        this.messageService.success('igo.geo.workspace.deleteSuccess');
      },
      error: (error: HttpErrorResponse) => {
        this._isLoading.set(false);
        this.handleEditionError(error);
      }
    });
  }

  private initNewFeatureProperties() {
    const sourceFields = this.layer.options.sourceOptions?.sourceFields ?? [];
    const properties: Record<string, unknown> = {};

    sourceFields.forEach((field) => {
      if (!field.primary) {
        properties[field.name] = '';
      }
    });

    return properties;
  }

  private closeEdition(feature: NewEditionFeature) {
    delete feature.edition;
    this.entityStore!.stateView.clear();
    this.edition = undefined;
    this.geometryEditor.disable();
  }

  private refreshLayer() {
    const olLayer = this.layer.dataSource.ol;
    olLayer.refresh();
  }

  private saveUpdateFeature(feature: NewEditionFeature) {
    const editionOptions = this.layer.dataSource.options.edition;
    if (!editionOptions) {
      throw Error('Missing edition options');
    }

    this._isLoading.set(true);

    const { modifyMethod, modifyHeaders } = editionOptions;

    const method = modifyMethod?.toUpperCase() ?? 'PATCH';
    const url = `${editionOptions.baseUrl}/${this.getFeatureId(feature)}`;
    const body = this.getUpdateBody(feature);
    const headers = new HttpHeaders(modifyHeaders);

    this.http
      .request(new HttpRequest(method, url, body, { headers }))
      .subscribe({
        next: () => {
          this._isLoading.set(false);
          this.closeEdition(feature);

          this.refreshLayer();

          this.messageService.success('igo.geo.workspace.modifySuccess');
        },
        error: (error: HttpErrorResponse) => {
          this._isLoading.set(false);
          this.closeEdition(feature);
          this.handleEditionError(error);
        }
      });
  }

  private saveCreateFeature(feature: NewEditionFeature) {
    const editionOptions = this.layer.dataSource.options.edition;
    if (!editionOptions) {
      throw Error('Missing edition options');
    }

    const { addUrl, addHeaders } = editionOptions;

    const url = new URL(addUrl ?? '', this.options.editionUrl).href;
    const headers = new HttpHeaders(addHeaders);

    this._isLoading.set(true);
    this.http.post(url, this.getCreateBody(feature), { headers }).subscribe({
      next: () => {
        this._isLoading.set(false);
        this.closeEdition(feature);
        this.refreshLayer();

        this.messageService.success('igo.geo.workspace.addSuccess');
      },
      error: (error: HttpErrorResponse) => {
        this._isLoading.set(false);
        this.closeEdition(feature);
        this.handleEditionError(error);
      }
    });
  }

  private handleEditionError(error: HttpErrorResponse) {
    error.error.caught = true;
    this.messageService.error('igo.geo.workspace.addError');
  }

  private cancelCreation(feature: NewEditionFeature) {
    if (this.edition?.type !== EditionType.CREATION) {
      throw Error("Can't cancel creation current edition is not creation");
    }
    this.entityStore!.delete(feature);
    // TODO CHECK this.rowsInMapExtentCheckCondition$.next(true);
  }

  private cancelUpdate(feature: NewEditionFeature) {
    const edition = this.edition;
    if (!edition || edition.type !== EditionType.UPDATE) {
      throw Error("Can't cancel update current edition is not update");
    }

    const { featureData } = edition;

    feature.properties = featureData.properties;
    feature.geometry = featureData.geometry;

    this.edition = undefined;
  }

  private focusEditedFeature(feature: NewEditionFeature) {
    this.entityStore!.state.updateAll({ edit: false });
    this.entityStore!.stateView.filter(
      (record: EntityRecord<object>) => !!record.state.edit
    );

    this.entityStore!.state.update(feature, { edit: true }, true);
  }

  abstract getUpdateBody(feature: NewEditionFeature): object;
  abstract getCreateBody(feature: NewEditionFeature): object;
}
