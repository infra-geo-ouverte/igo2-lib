import { Component, Input,
  AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Layer } from '../../layer';
import { IgoMap } from '../shared';
import { baseLayersSwitcherSlideInOut } from './baselayers-switcher.animation';

@Component({
  selector: 'igo-baselayers-switcher',
  templateUrl: './baselayers-switcher.component.html',
  styleUrls: ['./baselayers-switcher.component.styl'],
  animations: [
    baseLayersSwitcherSlideInOut()
  ]
})
export class BaseLayersSwitcherComponent implements AfterViewInit, OnDestroy {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  public baseLayers: Layer[] = [];
  public expand: boolean = false;

  private baseLayer$$: Subscription;
  private baseLayers$$: Subscription;

  constructor() {}

  ngAfterViewInit() {
    this.baseLayers$$ = this.map.baseLayers$.subscribe((arrayBL) => {
      this.baseLayers = arrayBL.filter((l) => l !== this._map.baseLayer);
    });
    this.baseLayer$$ = this.map.baseLayer$.subscribe((bl) => {
      this.baseLayers = this._map.baseLayers.filter((l) => l !== bl);
    });
  }

  ngOnDestroy() {
    this.baseLayers$$.unsubscribe();
    this.baseLayer$$.unsubscribe();
  }

  collapseOrExpand() {
    if (this.baseLayers.length > 1) {
      this.expand = !this.expand;
    }
  }
}
