import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeoJSONGeometry, GeometryFormFieldComponent, IgoMap } from '@igo2/geo';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-region-draw',
  templateUrl: './region-draw.component.html',
  styleUrls: ['./region-draw.component.scss']
})
export class RegionDrawComponent implements OnInit, AfterViewInit {
  @Input() map: IgoMap;
  @Input() formControl: FormControl;
  @Input() disabled: boolean = false;
  
  @ViewChild('geometryFormField') geometryFormField: GeometryFormFieldComponent;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.geometryFormField.value$.subscribe((value) => console.log(value));
  }

  resetRegion() {
    this.formControl = new FormControl();
  }

  printRegion() {
    console.log(this.formControl);
  }

  get value$(): BehaviorSubject<GeoJSONGeometry> {
    return this.geometryFormField.value$;
  }
}
