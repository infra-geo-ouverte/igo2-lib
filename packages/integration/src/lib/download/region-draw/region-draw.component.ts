import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { GeoJSONGeometry, GeometryFormFieldComponent, IgoMap } from '@igo2/geo';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-region-draw',
  templateUrl: './region-draw.component.html',
  styleUrls: ['./region-draw.component.scss']
})
export class RegionDrawComponent implements AfterViewInit {
  @Input() map: IgoMap;
  @Input() regionGeometryForm: FormControl;
  @Input() disabled: boolean = false;
  @ViewChild('geometryFormField') geometryFormField: GeometryFormFieldComponent;

  drawChecked: boolean = true;

  constructor() { }

  ngAfterViewInit() {
    this.geometryFormField.geometryType$.subscribe(() => {
      this.drawChecked = true;
      this.activateDraw();
    });

    this.geometryFormField.value$.subscribe((geometry) => {
      if (!geometry) {
        this.drawChecked = true;
        this.activateDraw();
      }
    });
  }

  toggleDraw(slideToggleChange: MatSlideToggleChange) {
    if (slideToggleChange.checked) {
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
