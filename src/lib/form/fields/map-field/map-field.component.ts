import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IgoMap, MapViewOptions } from '../../../map';
import { Layer } from '../../../layer';


@Component({
  selector: 'igo-map-field',
  templateUrl: './map-field.component.html',
  styleUrls: ['./map-field.component.styl'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MapFieldComponent),
      multi: true
    }
  ]
})
export class MapFieldComponent implements ControlValueAccessor {

  @Input()
  get label() { return this._label; }
  set label(value: string) {
    this._label = value;
  }
  private _label: string = 'map';

  @Input()
  get value(): [number, number] { return this._value; }
  set value(value: [number, number]) {
    this._value = value;
    this.onChange(value);
    this.onTouched();
  }
  private _value: [number, number];

  @Input()
  get view(): MapViewOptions { return this._view; }
  set view(value: MapViewOptions) {
    this._view = value;
    if (this.map !== undefined) {
      this.map.setView(value);
    }
  }
  protected _view: MapViewOptions;

  @Input()
  get layers(): Layer[] { return this._layers; }
  set layers(value: Layer[]) {
    this._layers = value;
    this.map.removeLayers();
    this.map.addLayers(value);
  }
  private _layers: Layer[];

  public map = new IgoMap();

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

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

  ngAfterViewInit() {
    this.map.olMap.on('singleclick', this.handleMapClick, this);
  }

  private handleMapClick(event: ol.MapBrowserEvent) {
    this.value = event.coordinate;
    console.log(this.value);
  }
}
