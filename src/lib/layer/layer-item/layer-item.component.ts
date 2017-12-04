import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef,
         ChangeDetectionStrategy, Optional } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MetadataService, MetadataOptions } from '../../metadata';
import { Layer } from '../shared/layers/layer';
import { ContextService } from '../../context/shared';
import { RouteService } from '../../core';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LayerItemComponent implements OnInit, OnDestroy {

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
              private metadataService: MetadataService,
              private contextService: ContextService,
              @Optional() private route: RouteService) {}

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }
  getCurrentLayerId(): any {
    return this.layer.dataSource.options['id'] ?
    this.layer.dataSource.options['id'] : this.layer.id;
  }
  ngOnInit() {
    this.getLayerParamVisibilityUrl();
   }

   private getLayerParamVisibilityUrl() {
    const current_context = this.contextService.context$.value['uri'];
    const current_layerid: string = this.getCurrentLayerId();
    if (this.route && this.route.options.visibleOnLayersKey &&
      this.route.options.visibleOffLayersKey &&
      this.route.options.contextKey ) {
      this.route.queryParams.subscribe(params => {
              const contextParams =  params[this.route.options.contextKey as string];
              if (contextParams === current_context || current_context === '_default' ) {
                let visibleOnLayersParams = '';
                let visibleOffLayersParams = '';
                let visiblelayers: string[] = [];
                let invisiblelayers: string[] = [];

                if (this.route.options.visibleOnLayersKey &&
                  params[this.route.options.visibleOnLayersKey as string]) {
                  visibleOnLayersParams = params[this.route.options.visibleOnLayersKey as string];
                }
                if (this.route.options.visibleOffLayersKey &&
                  params[this.route.options.visibleOffLayersKey as string]) {
                  visibleOffLayersParams = params[this.route.options.visibleOffLayersKey as string];
                }
                /* This order is important because to control whichever
                the order of * param. First whe open and close everything.*/
                if (visibleOnLayersParams === '*') {
                  this.layer.visible = true;
                }
                if (visibleOffLayersParams === '*') {
                  this.layer.visible = false;
                }
                // After, managing named layer by id (context.json OR id from datasource)
                visiblelayers =  visibleOnLayersParams.split(',');
                invisiblelayers =  visibleOffLayersParams.split(',');
                if (visiblelayers.indexOf(current_layerid) > -1) {
                  this.layer.visible = true;
                }
                if (invisiblelayers.indexOf(current_layerid) > -1) {
                  this.layer.visible = false;
                }
              }
      });
    }
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
