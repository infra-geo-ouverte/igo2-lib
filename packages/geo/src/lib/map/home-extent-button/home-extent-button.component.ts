import { ConfigService } from '@igo2/core';
import { Component, Input } from '@angular/core';
import { IgoMap } from '../shared/map';
/*
Button to center the map to the home extent
*/
@Component({
  selector: 'igo-home-extent-button',
  templateUrl:'./home-extent-button.component.html',
  styleUrls: ['./home-extent-button.component.scss'],
})
export class HomeExtentButtonComponent {
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
  public homeExtentButtonExtent
  public homeExtentButtonCenter
  public homeExtentButtonZoom

  constructor(public configService: ConfigService) {
    this.homeExtentButtonExtent = this.configService.getConfig('setHomeExtentButton.homeExtButtonExtent'); // [-8000000, 5800000, -6800000, 6900000] MINX | MINY | MAXX | MAXY EPSG:3857 - WGS 84 / Pseudo-Mercator (meters)
    this.homeExtentButtonCenter = this.configService.getConfig('setHomeExtentButton.homeExtButtonCenter'); //  [-71.938087, 47.446975]
    this.homeExtentButtonZoom = this.configService.getConfig('setHomeExtentButton.homeExtButtonZoom'); //  6
  }

onToggleClick($event){
  if (this.homeExtentButtonExtent) {
    this.map.viewController.zoomToExtent(this.homeExtentButtonExtent);
  }
   else if (this.homeExtentButtonCenter && this.homeExtentButtonZoom) {
    this.map.setView({center : this.homeExtentButtonCenter, zoom: this.homeExtentButtonZoom});
  }
}
}
