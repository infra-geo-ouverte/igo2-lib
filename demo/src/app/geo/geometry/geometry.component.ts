import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';

import { LanguageService } from '@igo2/core';
import { Form, FormService } from '@igo2/common';
import { IgoMap, DataSourceService, LayerService } from '@igo2/geo';

@Component({
  selector: 'app-geometry',
  templateUrl: './geometry.component.html',
  styleUrls: ['./geometry.component.scss']
})
export class AppGeometryComponent implements OnInit, OnDestroy {

  map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  view = {
    center: [-73, 47.2],
    zoom: 15
  };

  form$ = new BehaviorSubject<Form>(undefined);

  data$ = new BehaviorSubject<{[key: string]: any}>(undefined);

  submitDisabled: boolean = true;

  private valueChanges$$: Subscription;

  constructor(
    private languageService: LanguageService,
    private formService: FormService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });

    const fieldConfigs = [
      {
        name: 'geometry',
        title: 'Geometry',
        options:  {
          validator: Validators.required
        },
        type: 'geometry',
        inputs: {
          map: this.map,
          geometryType: 'Polygon',
          buffer: 50
        }
      },
      {
        name: 'name',
        title: 'Name',
        options:  {
          validator: Validators.required
        }
      }
    ];

    const fields = fieldConfigs.map((config) => this.formService.field(config));
    const form = this.formService.form([], [this.formService.group({name: 'info'}, fields)]);

    this.valueChanges$$ = form.control.valueChanges.subscribe(() => {
      this.submitDisabled = !form.control.valid;
    });

    this.form$.next(form);
  }

  ngOnDestroy() {
    this.valueChanges$$.unsubscribe();
  }

  fillForm() {
    this.data$.next({
      name: 'Place',
      geometry: JSON.stringify({type: 'Polygon', coordinates: [[
        [-106, 42],
        [-107, 31],
        [-81, 32],
        [-82, 42],
        [-106, 42]
      ]]})
    });
  }

  clearForm() {
    this.form$.value.control.reset();
  }

  onSubmit(data: {[key: string]: any}) {
    alert(JSON.stringify(data));
  }
}
