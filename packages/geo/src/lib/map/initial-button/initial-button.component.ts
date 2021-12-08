import { ConfigService } from '@igo2/core';
import { Component, Input } from '@angular/core';
import { IgoMap } from '../shared/map';
/*
Button to center to initial the map extent
*/
@Component({
  selector: 'igo-initial-button',
  templateUrl:'./initial-button.component.html',
  styleUrls: ['./initial-button.component.scss'],
})
export class InitialButtonComponent {
  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;
  @Input()
  get color(): string {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;
  public initialExtent
  public initialCenter
  public initialZoom

  constructor(public configService: ConfigService) {
      this.initialExtent = this.configService.getConfig('setInitialButton.initExtent'); // [-8000000, 5800000, -6800000, 6900000] MINX | MINY | MAXX | MAXY EPSG:3857 - WGS 84 / Pseudo-Mercator (meters)
      this.initialCenter = this.configService.getConfig('setInitialButton.initCenter'); //  [-71.938087, 47.446975]
      this.initialZoom = this.configService.getConfig('setInitialButton.initZoom'); //  6
  }

onToggleClick($event){
  if (this.initialExtent) {
    this.map.viewController.zoomToExtent(this.initialExtent);
  }
   else if (this.initialCenter && this.initialZoom) {
    this.map.setView({center : this.initialCenter, zoom: this.initialZoom});
  }
}
}
