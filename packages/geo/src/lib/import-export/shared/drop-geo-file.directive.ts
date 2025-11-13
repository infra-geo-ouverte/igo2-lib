import {
  Directive,
  HostListener,
  OnDestroy,
  OnInit,
  OutputRefSubscription,
  inject,
  input
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { DragAndDropDirective } from '@igo2/common/drag-drop';
import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';

import { Observable, Subscription } from 'rxjs';
import { concatMap, filter, first, skipWhile } from 'rxjs/operators';

import { Feature } from '../../feature/shared/feature.interfaces';
import { LayerService } from '../../layer/shared/layer.service';
import { ProjectionsLimitationsOptions } from '../../map/';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { detectFileEPSG } from '../../map/shared/projection.utils';
import { StyleListService } from '../../style/style-list/style-list.service';
import { StyleService } from '../../style/style-service/style.service';
import { EpsgSelectorModalComponent } from '../epsg-selector-modal/epsg-selector-modal.component';
import {
  handleFileImportError,
  handleFileImportSuccess
} from '../shared/import.utils';
import { ImportExportServiceOptions } from './import.interface';
import { ImportService } from './import.service';

@Directive({
  selector: '[igoDropGeoFile]',
  standalone: true
})
export class DropGeoFileDirective
  extends DragAndDropDirective
  implements OnInit, OnDestroy
{
  private component = inject(MapBrowserComponent);
  private importService = inject(ImportService);
  private styleListService = inject(StyleListService);
  private styleService = inject(StyleService);
  private config = inject(ConfigService);
  private messageService = inject(MessageService);
  private layerService = inject(LayerService);
  private confirmDialogService = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  private epsgCode$$: Subscription[] = [];
  private filesDropped$$: OutputRefSubscription;

  get map(): IgoMap {
    return this.component.map();
  }

  readonly contextUri = input<string>(undefined);
  readonly projectionsLimitations =
    input<ProjectionsLimitationsOptions>(undefined);

  ngOnInit() {
    this.filesDropped$$ = this.filesDropped.subscribe((files) => {
      this.onFilesDropped(files);
    });
  }

  ngOnDestroy() {
    this.filesDropped$$.unsubscribe();
    this.epsgCode$$.map((e) => e.unsubscribe());
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(evt) {
    super.onDragOver(evt);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    super.onDragLeave(evt);
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
    super.onDrop(evt);
  }

  private onFilesDropped(files: File[]) {
    for (const file of files) {
      this.epsgCode$$.push(
        detectFileEPSG({ file })
          .pipe(
            skipWhile((code) => !code),
            first(),
            concatMap((epsgCode) => {
              if (!epsgCode || epsgCode === 'epsgNotDefined') {
                return this.openEPSGModal(file).pipe(
                  filter((selectedCode) => !!selectedCode), // user must select
                  concatMap((selectedCode) =>
                    this.importService.import(file, selectedCode)
                  )
                );
              } else {
                return this.importService.import(file, epsgCode);
              }
            })
          )
          .subscribe(
            (features: Feature[]) => this.onFileImportSuccess(file, features),
            (error: Error) => this.onFileImportError(file, error)
          )
      );
    }
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    const importExportOptions = this.config.getConfig(
      'importExport'
    ) as ImportExportServiceOptions;
    const confirmDialogService = importExportOptions?.allowToStoreLayer
      ? this.confirmDialogService
      : undefined;
    if (!importExportOptions?.importWithStyle) {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.contextUri(),
        this.messageService,
        this.layerService,
        confirmDialogService
      );
    } else {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.contextUri(),
        this.messageService,
        this.layerService,
        confirmDialogService,
        this.styleListService,
        this.styleService
      );
    }
  }

  private onFileImportError(file: File, error: Error) {
    handleFileImportError(
      file,
      error,
      this.messageService,
      this.config.getConfig('importExport.clientSideFileSizeMaxMb')
    );
  }

  private openEPSGModal(file): Observable<string> {
    const dialogRef = this.dialog.open(EpsgSelectorModalComponent, {
      width: '600px',
      data: {
        fileName: file.name,
        projections: this.importService.computeProjections(
          this.projectionsLimitations()
        )
      }
    });

    return dialogRef.afterClosed();
  }
}
