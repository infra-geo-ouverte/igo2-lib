import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeoJSONGeometry, GeometryFormFieldComponent, IgoMap } from '@igo2/geo';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-region-draw',
  templateUrl: './region-draw.component.html',
  styleUrls: ['./region-draw.component.scss']
})
export class RegionDrawComponent implements OnInit {
  @Input() map: IgoMap;
  @Input() formControl: FormControl;
  @Input() disabled: boolean = false;
  
  @ViewChild('geometryFormField') geometryFormField: GeometryFormFieldComponent;

  constructor() { }

  ngOnInit() {
  }

  get value$(): BehaviorSubject<GeoJSONGeometry> {
    return this.geometryFormField.value$;
  }
}
