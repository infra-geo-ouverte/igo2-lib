import {
  Component,
  Input,
  forwardRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as olproj from 'ol/proj';
import olFeature from 'ol/Feature';
import olMapBrowserEvent from 'ol/MapBrowserEvent';
import olPoint from 'ol/geom/Point';

import { IgoMap, MapViewOptions } from '../../../map';
import { Layer } from '../../../layer';

@Component({
  selector: 'igo-map-field',
  templateUrl: './map-field.component.html',
  styleUrls: ['./map-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MapFieldComponent),
      multi: true
    }
  ]
})
export class MapFieldComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }
  private _placeholder: string;

  @Input()
  get decimals(): number {
    return this._decimals;
  }
  set decimals(value: number) {
    this._decimals = value;
  }
  private _decimals = 6;

  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: boolean) {
    this._readonly = value;
  }
  protected _readonly = false;

  @Input()
  get value(): [number, number] {
    return this._value;
  }
  set value(value: [number, number]) {
    this.map.clearOverlay();

    if (value === undefined) {
      this._value = value;
      this.onChange(this._value);
      return;
    }

    if (!isNaN(+value[0]) && !isNaN(+value[1])) {
      const values = [+value[0], +value[1]] as [number, number];

      this.addOverlay(values);

      this._value = [
        +values[0].toFixed(this.decimals),
        +values[1].toFixed(this.decimals)
      ];

      this.onChange(this._value);
      this.onTouched();
    }
  }
  private _value: [number, number];

  @Input()
  get view(): MapViewOptions {
    return this._view;
  }
  set view(value: MapViewOptions) {
    this._view = value;
    if (this.map !== undefined) {
      this.map.setView(value);
    }
  }
  protected _view: MapViewOptions;

  @Input()
  get layers(): Layer[] {
    return this._layers;
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.map.removeLayers();
    this.map.addLayers(value);
  }
  private _layers: Layer[];

  public map = new IgoMap();
  public projection = 'EPSG:4326';

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngAfterViewInit() {
    this.map.ol.on('singleclick', e => this.handleMapClick(e));
  }

  ngOnDestroy() {
    this.map.ol.un('singleclick', e => this.handleMapClick(e));
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  writeValue(value: [number, number]) {
    if (value) {
      this.value = value;
    }
  }

  handleValueChange(value: string) {
    this.value = this.parseValue(value);
  }

  private handleMapClick(event: olMapBrowserEvent) {
    this.value = olproj.transform(
      event.coordinate,
      this.map.projection,
      this.projection
    );
  }

  private parseValue(value: string): [number, number] | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }

    const values = value.split(',').filter(v => v !== '');
    if (values.length === 2) {
      return [+values[0], +values[1]];
    }

    return undefined;
  }

  private addOverlay(coordinates: [number, number]) {
    const geometry = new olPoint(
      olproj.transform(coordinates, this.projection, this.map.projection)
    );
    const extent = geometry.getExtent();
    const feature = new olFeature({ geometry: geometry });

    this.map.moveToExtent(extent);
    this.map.addOverlay(feature);
  }
}
