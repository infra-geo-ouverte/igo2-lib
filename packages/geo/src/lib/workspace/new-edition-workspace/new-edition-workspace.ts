import {
  // HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Signal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
import { MessageService } from '@igo2/core/message';

import { Feature } from '../../feature';
import { ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import { ConfirmationPopupComponent } from '../confirmation-popup';
import { EditionOverlay } from './rendering/edition-overlay';
import { EditionStrategy } from './strategy/edition-strategy';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
  editionUrl: string;
}

export class NewEditionWorkspace extends Workspace {
  // TODO !!IMPORTANT!! rename to EditionWorkspace
  readonly isLoading: Signal<boolean>;
  readonly canEdit: Signal<boolean>;

  private readonly _isLoading = signal(false);
  private readonly _canEdit = signal(true);

  private activeFeature: Feature | undefined;
  private overlay: EditionOverlay;

  constructor(
    private strategy: EditionStrategy,
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
    this.overlay = new EditionOverlay(
      this.map,
      this.options.layer.dataSource.options.edition?.geomType ?? 'Point'
    );
    this.isLoading = this._isLoading.asReadonly();
    this.canEdit = this._canEdit.asReadonly();
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

  get canDelete(): boolean {
    return this.layer.dataSource.options.edition?.deleteButton !== false;
  }

  isEditing(feature: Feature): boolean {
    return this.activeFeature === feature;
  }

  deleteFeature(feature: Feature) {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      disableClose: false,
      data: { type: 'delete' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this._isLoading.set(true);
        this.strategy.delete(feature).subscribe({
          next: () => {
            this._isLoading.set(false);
            // this.refreshLayer();
            this.messageService.success('igo.geo.workspace.deleteSuccess');
          },
          error: (_error: HttpErrorResponse) => {
            this._isLoading.set(false);
            // todo
            // this.handleEditionError(error);
          }
        });
      }
    });
  }

  saveFeature(feature: Feature) {
    const workingCopy = this.overlay.getWorkingCopy();
    if (!workingCopy) throw Error("Can't save feature: no active edit");
    this._isLoading.set(true);
    this.strategy.update(workingCopy, feature).subscribe({
      next: () => {
        this._isLoading.set(false);
        this.activeFeature = undefined;
        this._canEdit.set(true);
        this.overlay.clear();
        this.refreshLayer();
        // this.messageService.success('igo.geo.workspace.updateSuccess');
      },
      error: (_error: HttpErrorResponse) => {
        this._isLoading.set(false);
        // todo
        // this.messageService.success('igo.geo.workspace.updateError');
      }
    });
  }

  editFeature(feature: Feature) {
    this._canEdit.set(false);
    this.overlay.enableModify(feature);
    this.activeFeature = feature;
  }

  cancelEdit(_feature: Feature) {
    this.activeFeature = undefined;
    this._canEdit.set(true);
  }

  private refreshLayer() {
    const olLayer = this.layer.dataSource.ol;
    olLayer.refresh();
  }
}
