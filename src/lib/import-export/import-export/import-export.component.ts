import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { MapService } from '../../map';
import { VectorLayer } from '../../layer/shared/layers';
import { ImportExportService, ExportFormat, ExportOptions } from '../shared';

@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.styl']
})
export class ImportExportComponent implements OnDestroy, OnInit {

  public form: FormGroup;
  public formats = ExportFormat;
  public layers;
  public inputProj;
  private layers$$: Subscription;

  constructor(private importExportService: ImportExportService,
              private mapService: MapService,
              private formBuilder: FormBuilder) {

    this.buildForm();
  }

  loadFile(files: Array<File>) {
    this.importExportService.import(files, this.inputProj);
  }

  handleFormSubmit(data: ExportOptions) {
    this.importExportService.export(data);
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  ngOnInit() {
    this.layers$$ = this.mapService.getMap().layers$.subscribe(layers => {
      this.layers = layers.filter((layer) => layer instanceof VectorLayer);
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      format: ['', [Validators.required]],
      layer: ['', [Validators.required]]
    });
  }

}
