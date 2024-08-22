import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { DragAndDropDirective } from '@igo2/common/drag-drop';
import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';

import { Subscription } from 'rxjs';
import { concatMap, first, skipWhile } from 'rxjs/operators';

import { Feature } from '../../feature/shared/feature.interfaces';
import { LayerService } from '../../layer/shared/layer.service';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { detectFileEPSG } from '../../map/shared/projection.utils';
import { StyleListService } from '../../style/style-list/style-list.service';
import { StyleService } from '../../style/style-service/style.service';
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
  protected filesDropped: EventEmitter<File[]> = new EventEmitter();
  protected filesInvalid: EventEmitter<File[]> = new EventEmitter();
  private epsgCode$$: Subscription[] = [];
  private filesDropped$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  @Input() contextUri: string;

  constructor(
    private component: MapBrowserComponent,
    private importService: ImportService,
    private styleListService: StyleListService,
    private styleService: StyleService,
    private config: ConfigService,
    private messageService: MessageService,
    private layerService: LayerService,
    private confirmDialogService: ConfirmDialogService
  ) {
    super();
  }

  ngOnInit() {
    this.filesDropped$$ = this.filesDropped.subscribe((files: File[]) => {
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
              return this.importService.import(
                file,
                epsgCode === 'epsgNotDefined' ? undefined : epsgCode
              );
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
        this.contextUri,
        this.messageService,
        this.layerService,
        confirmDialogService
      );
    } else {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.contextUri,
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
}
