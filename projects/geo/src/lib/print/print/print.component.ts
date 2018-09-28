import { Component, Input } from '@angular/core';

import { SubjectStatus } from '@igo2/utils';

import { IgoMap } from '../../map/shared/map';

import { PrintOptions } from '../shared/print.interface';

import {
  PrintOutputFormat,
  PrintPaperFormat,
  PrintOrientation,
  PrintResolution,
  PrintSaveImageFormat
} from '../shared/print.type';

import { PrintService } from '../shared/print.service';

@Component({
  selector: 'igo-print',
  templateUrl: './print.component.html'
})
export class PrintComponent {
  public disabled = false;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get outputFormat(): PrintOutputFormat {
    return this._outputFormat;
  }
  set outputFormat(value: PrintOutputFormat) {
    this._outputFormat = value;
  }
  private _outputFormat: PrintOutputFormat;

  @Input()
  get paperFormat(): PrintPaperFormat {
    return this._paperFormat;
  }
  set paperFormat(value: PrintPaperFormat) {
    this._paperFormat = value;
  }
  private _paperFormat: PrintPaperFormat;

  @Input()
  get orientation(): PrintOrientation {
    return this._orientation;
  }
  set orientation(value: PrintOrientation) {
    this._orientation = value;
  }
  private _orientation: PrintOrientation;

  @Input()
  get imageFormat(): PrintSaveImageFormat {
    return this._imageFormat;
  }
  set imageFormat(value: PrintSaveImageFormat) {
    this._imageFormat = value;
  }
  private _imageFormat: PrintSaveImageFormat;

  @Input()
  get resolution(): PrintResolution {
    return this._resolution;
  }
  set resolution(value: PrintResolution) {
    this._resolution = value;
  }
  private _resolution: PrintResolution;

  constructor(private printService: PrintService) {}

  handleFormSubmit(data: PrintOptions) {
    this.disabled = true;

    if (data.isPrintService === true) {
      this.printService
        .print(this.map, data)
        .subscribe((status: SubjectStatus) => {});
    } else {
      let nbFileToProcess = 1;

      if (data.showLegend) {
        nbFileToProcess++;
      }
      if (data.imageFormat.toLowerCase() === 'tiff') {
        nbFileToProcess++;
      }

      this.printService.defineNbFileToProcess(nbFileToProcess);

      this.printService.downloadMapImage(
        this.map,
        data.imageFormat,
        data.showProjection,
        data.showScale,
        data.showLegend,
        data.title,
        data.comment,
        data.doZipFile
      );
      if (data.showLegend) {
        this.printService.getLayersLegendImage(this.map, data.imageFormat, data.doZipFile);
      }
    }
    this.disabled = false;
  }
}
