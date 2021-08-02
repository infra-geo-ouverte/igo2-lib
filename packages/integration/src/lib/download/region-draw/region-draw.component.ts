import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { GeoJSONGeometry, GeometryFormFieldComponent, IgoMap } from '@igo2/geo';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-region-draw',
  templateUrl: './region-draw.component.html',
  styleUrls: ['./region-draw.component.scss']
})
export class RegionDrawComponent implements OnInit {
  @Input() map: IgoMap;
  @Input() regionGeometryForm: FormControl;
  @Input() disabled: boolean = false;
  @ViewChild('geometryFormField') geometryFormField: GeometryFormFieldComponent;

  drawChecked: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleDraw(value: MatSlideToggleChange) {
    console.log(value);
    if (value.checked) {
      this.activateDraw();
    } else {
      this.deactivateDraw();
    }
  }

  deactivateDraw() {
    this.geometryFormField.drawControlIsActive = false;
  }

  activateDraw() {
    this.geometryFormField.drawControlIsActive = true;
  }

  get value$(): BehaviorSubject<GeoJSONGeometry> {
    return this.geometryFormField.value$;
  }
}
