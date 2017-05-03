import { Component, Input } from '@angular/core';

import { IgoMap } from '../../map';

import { PrintFormat, PrintOptions, PrintOrientation,
         PrintResolution, PrintService } from '../shared';

@Component({
  selector: 'igo-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.styl']
})
export class PrintComponent {

  public disabled: boolean = false;

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get format(): PrintFormat { return this._format; }
  set format(value: PrintFormat) {
    this._format = value;
  }
  private _format: PrintFormat;

  @Input()
  get orientation(): PrintOrientation { return this._orientation; }
  set orientation(value: PrintOrientation) {
    this._orientation = value;
  }
  private _orientation: PrintOrientation;

  @Input()
  get resolution(): PrintResolution { return this._resolution; }
  set resolution(value: PrintResolution) {
    this._resolution = value;
  }
  private _resolution: PrintResolution;

  constructor(private printService: PrintService) { }

  handleFormSubmit(data: PrintOptions) {
    this.disabled = true;
    this.printService.print(this.map, data).subscribe((status) =>
      this.disabled = false);
  }

}
