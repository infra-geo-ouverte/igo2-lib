import { Directive, HostListener, EventEmitter, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { MessageService, LanguageService, ConfigService } from '@igo2/core';
import { DragAndDropDirective } from '@igo2/common';

import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { ImportService } from './import.service';
import { handleFileImportSuccess, handleFileImportError } from '../shared/import.utils';
import { StyleService } from '../../layer/shared/style.service';
import { StyleListService } from '../style-list/style-list.service';

@Directive({
  selector: '[igoDropGeoFile]'
})
export class DropGeoFileDirective extends DragAndDropDirective implements OnInit, OnDestroy {

  protected filesDropped: EventEmitter<File[]> = new EventEmitter();
  protected filesInvalid: EventEmitter<File[]> = new EventEmitter();

  private filesDropped$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    private component: MapBrowserComponent,
    private importService: ImportService,
    private languageService: LanguageService,
    private styleListService: StyleListService,
    private styleService: StyleService,
    private config: ConfigService,
    private messageService: MessageService
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
      this.importService
        .import(file)
        .subscribe(
          (features: Feature[]) => this.onFileImportSuccess(file, features),
          (error: Error) => this.onFileImportError(file, error)
        );
    }
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    if (!this.config.getConfig('importWithStyle')) {
      handleFileImportSuccess(file, features, this.map, this.messageService, this.languageService);
    } else {
      handleFileImportSuccess(file, features, this.map, this.messageService, this.languageService,
                               this.styleListService, this.styleService);
    }
  }

  private onFileImportError(file: File, error: Error) {
    handleFileImportError(file, error, this.messageService, this.languageService);
  }
}
