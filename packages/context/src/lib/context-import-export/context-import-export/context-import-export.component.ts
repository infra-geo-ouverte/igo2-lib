import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MessageService, ConfigService } from '@igo2/core';
import { Layer, VectorLayer } from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';

import { handleFileExportError } from '../shared/context-export.utils';
import {
  handleFileImportSuccess,
  handleFileImportError
} from '../shared/context-import.utils';
import { handleFileExportSuccess } from '../shared/context-export.utils';
import { ContextService } from '../../context-manager/shared/context.service';
import { ContextImportService } from '../shared/context-import.service';
import { ContextExportService } from '../shared/context-export.service';
import { DetailedContext } from '../../context-manager/shared/context.interface';

@Component({
  selector: 'igo-context-import-export',
  templateUrl: './context-import-export.component.html',
  styleUrls: ['./context-import-export.component.scss']
})
export class ContextImportExportComponent implements OnInit {
  public form: UntypedFormGroup;
  public layers: VectorLayer[];
  public inputProj: string = 'EPSG:4326';
  public loading$ = new BehaviorSubject(false);
  public forceNaming = false;
  public layerList: Layer[];
  public userControlledLayerList: Layer[];
  public res: DetailedContext;
  private clientSideFileSizeMax: number;
  public fileSizeMb: number;
  public activeImportExport: string = 'import';

  @Input() map: IgoMap;

  constructor(
    private contextImportService: ContextImportService,
    private contextExportService: ContextExportService,
    private messageService: MessageService,
    private formBuilder: UntypedFormBuilder,
    private config: ConfigService,
    private contextService: ContextService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    const configFileSizeMb = this.config.getConfig(
      'importExport.clientSideFileSizeMaxMb'
    );
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
    this.fileSizeMb = this.clientSideFileSizeMax / Math.pow(1024, 2);
    this.layerList = this.contextService.getContextLayers(this.map);
    this.userControlledLayerList = this.layerList.filter(layer => layer.showInLayerList);
  }

  importFiles(files: File[]) {
    this.loading$.next(true);
    for (const file of files) {
      this.contextImportService.import(file).pipe(take(1)).subscribe(
        (context: DetailedContext) => this.onFileImportSuccess(file, context),
        (error: Error) => this.onFileImportError(file, error),
        () => {
          this.loading$.next(false);
        }
      );
    }
  }

  handleExportFormSubmit(contextOptions) {
    this.loading$.next(true);
    this.res = this.contextService.getContextFromLayers(
      this.map,
      contextOptions.layers,
      contextOptions.name
    );
    this.res.imported = true;
    this.contextExportService.export(this.res).pipe(take(1)).subscribe(
      () => {},
      (error: Error) => this.onFileExportError(error),
      () => {
        this.onFileExportSuccess();
        this.loading$.next(false);
      }
    );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      layers: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });
  }

  private onFileImportSuccess(file: File, context: DetailedContext) {
    handleFileImportSuccess(
      file,
      context,
      this.messageService,
      this.contextService
    );
  }

  private onFileImportError(file: File, error: Error) {
    this.loading$.next(false);
    handleFileImportError(
      file,
      error,
      this.messageService,
      this.fileSizeMb
    );
  }

  private onFileExportError(error: Error) {
    this.loading$.next(false);
    handleFileExportError(error, this.messageService);
  }

  private onFileExportSuccess() {
    handleFileExportSuccess(this.messageService);
  }

  selectAll(e) {
    if (e._selected) {
      this.form.controls.layers.setValue(this.userControlledLayerList);
      e._selected = true;
    }
    if (e._selected === false) {
      this.form.controls.layers.setValue([]);
    }
  }

  onImportExportChange(event) {
    this.activeImportExport = event.value;
  }
}
