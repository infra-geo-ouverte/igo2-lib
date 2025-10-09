import { NgClass } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';

import { Subscription } from 'rxjs';

import { Layer } from '../../layer/shared';
import { IgoMap } from '../shared/map';
import { baseLayersSwitcherSlideInOut } from './baselayers-switcher.animation';
import { MiniBaseMapComponent } from './mini-basemap.component';

@Component({
  selector: 'igo-baselayers-switcher',
  templateUrl: './baselayers-switcher.component.html',
  styleUrls: ['./baselayers-switcher.component.scss'],
  animations: [baseLayersSwitcherSlideInOut()],
  imports: [
    NgClass,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MiniBaseMapComponent,
    IgoLanguageModule
  ]
})
export class BaseLayersSwitcherComponent implements AfterViewInit, OnDestroy {
  private mediaService = inject(MediaService);

  @Input() map: IgoMap;
  @Input() useStaticIcon: boolean;

  public _baseLayers: Layer[] = [];
  public expand = false;
  public showButton = true;

  private layers$$: Subscription;

  get hasMoreThanTwo(): boolean {
    return this.baseLayers.length > 1;
  }

  constructor() {
    const media = this.mediaService.media$.value;
    if (media === Media.Mobile && this.useStaticIcon === undefined) {
      this.useStaticIcon = true;
    }
  }

  ngAfterViewInit() {
    this.layers$$ = this.map.layerController.baseLayers$.subscribe((layers) => {
      this._baseLayers = layers ?? [];
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  collapseOrExpand() {
    if (this.hasMoreThanTwo || this.useStaticIcon) {
      this.expand = !this.expand;
    } else {
      this.expand = false;
    }
  }

  get baseLayers(): Layer[] {
    const mapResolution = this.map.viewController.getResolution();
    const mapZoom = this.map.viewController.getZoom();

    const bl = this._baseLayers.filter((l) => {
      return (
        (!l.options.maxResolution ||
          mapResolution <= l.options.maxResolution) &&
        (!l.options.minResolution ||
          mapResolution >= l.options.minResolution) &&
        (!l.options.source.options.maxZoom ||
          mapZoom <= l.options.source.options.maxZoom) &&
        (!l.options.source.options.minZoom ||
          mapZoom >= l.options.source.options.minZoom)
      );
    });

    const blHidden = bl.filter((l) => !l.visible);
    return blHidden.length + 1 === bl.length ? blHidden : bl;
  }
}
