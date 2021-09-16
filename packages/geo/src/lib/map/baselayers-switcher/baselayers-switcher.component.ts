import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MediaService, Media } from '@igo2/core';
import { Layer } from '../../layer';
import { IgoMap } from '../shared';
import { baseLayersSwitcherSlideInOut } from './baselayers-switcher.animation';

@Component({
  selector: 'igo-baselayers-switcher',
  templateUrl: './baselayers-switcher.component.html',
  styleUrls: ['./baselayers-switcher.component.scss'],
  animations: [baseLayersSwitcherSlideInOut()]
})
export class BaseLayersSwitcherComponent implements AfterViewInit, OnDestroy {
  @Input() map: IgoMap;
  @Input() useStaticIcon: boolean;

  public _baseLayers: Layer[] = [];
  public expand = false;
  public showButton = true;

  private layers$$: Subscription;

  constructor(private mediaService: MediaService) {
    const media = this.mediaService.media$.value;
    if (media === Media.Mobile && this.useStaticIcon === undefined) {
      this.useStaticIcon = true;
    }
  }

  ngAfterViewInit() {
    this.layers$$ = this.map.layers$.subscribe(arrayLayers => {
      this._baseLayers = arrayLayers.filter(l => l.baseLayer);
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  collapseOrExpand() {
    if (this.baseLayers.length > 1 || this.useStaticIcon) {
      this.expand = !this.expand;
    } else {
      this.expand = false;
    }
  }

  get baseLayers(): Layer[] {
    const mapResolution = this.map.viewController.getResolution();
    const mapZoom = this.map.viewController.getZoom();

    const bl = this._baseLayers.filter(l => {
      return (
        (!l.options.maxResolution ||
          mapResolution <= l.options.maxResolution) &&
        (!l.options.minResolution || mapResolution >= l.options.minResolution) &&
        (!l.options.source.options.maxZoom || mapZoom <= l.options.source.options.maxZoom) &&
        (!l.options.source.options.minZoom || mapZoom >= l.options.source.options.minZoom)
      );
    });

    const blHidden = bl.filter(l => !l.visible);
    return blHidden.length + 1 === bl.length ? blHidden : bl;
  }
}
