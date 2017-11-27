import { Component, Input, OnDestroy, ChangeDetectorRef,
         ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MetadataService, MetadataOptions } from '../../metadata';
import { Layer } from '../shared/layers/layer';


@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LayerItemComponent implements OnDestroy {

  @Input()
  get layer(): Layer { return this._layer; }
  set layer(value: Layer) {
    this._layer = value;
    this.subscribeResolutionObserver();
  }
  private _layer: Layer;

  @Input()
  get edition() { return this._edition; }
  set edition(value: boolean) {
    this._edition = value;
  }
  private _edition: boolean = false;

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  @Input()
  get toggleLegendOnVisibilityChange() {
    return this._toggleLegendOnVisibilityChange;
  }
  set toggleLegendOnVisibilityChange(value: boolean) {
    this._toggleLegendOnVisibilityChange = value;
  }
  private _toggleLegendOnVisibilityChange: boolean = false;

  get opacity () {
    return this.layer.opacity * 100;
  }

  set opacity (opacity: number) {
    this.layer.opacity = opacity / 100;
  }

  private resolution$$: Subscription;

  constructor(private cdRef: ChangeDetectorRef,
              private metadataService: MetadataService) {}

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.layer.collapsed = collapsed;
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
  }

  isInResolutionsRange() {
    if (!this.layer.map) { return false; }

    const resolution = this.layer.map.resolution;
    const minResolution = this.layer.ol.getMinResolution();
    const maxResolution = this.layer.ol.getMaxResolution();

    return resolution >= minResolution &&
           resolution <= maxResolution;
  }

  openMetadata(metadata: MetadataOptions) {
    this.metadataService.open(metadata);
  }

  private subscribeResolutionObserver() {
    if (!this.layer || !this.layer.map) {
      return;
    }
    this.resolution$$ = this.layer.map.resolution$.subscribe((resolution) => {
      this.cdRef.detectChanges();
    });
  }
}
