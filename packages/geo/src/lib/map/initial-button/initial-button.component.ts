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
      this.initialExtent = this.configService.getConfig('InitialButton.initExtent');
      this.initialCenter = this.configService.getConfig('InitialButton.initCenter');
      this.initialZoom = this.configService.getConfig('InitialButton.initZoom');
  }
/*
onToggleClick($event){
  if (this.initialExtent) {
  this.map.viewController.zoomToExtent(this.initialExtent)
}
 else if (this.homeCenter && tihs.homeZoom)  {
  this.map.setView({center : this.homeCenter, zoom: this.homeZoom})
}

}*/


onToggleClick($event){
    if (typeof this.configService.getConfig('InitialButton.extent')!==
  'undefined') {
    this.map.viewController.zoomToExtent(this.initialExtent);
  }
   else   {
    this.map.setView({center : this.initialCenter, zoom: this.initialZoom});
  }
}
/*
onToggleClick($event){
  this.map.setView({ center : [-70.938087, 48.446975], zoom : 6 });
}*/
}
