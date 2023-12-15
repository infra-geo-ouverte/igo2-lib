import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Form, FormField, FormFieldConfig, FormService } from '@igo2/common';
import { DataSource, DataSourceService, IgoMap, LayerService } from '@igo2/geo';

import * as olstyle from 'ol/style';

import { BehaviorSubject, Subscription } from 'rxjs';

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

  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);

  submitDisabled = true;

  private valueChanges$$: Subscription;

  constructor(
    private formService: FormService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe((dataSource: DataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          })
        );
      });

    const fieldConfigs: FormFieldConfig[] = [
      {
        name: 'geometry',
        title: 'Geometry',
        options: {
          validator: Validators.required
        },
        type: 'geometry',
        inputs: {
          map: this.map,
          geometryTypeField: true,
          geometryType: 'Polygon',
          drawGuideField: true,
          drawGuide: 50,
          drawGuidePlaceholder: 'Draw Guide',
          drawStyle: new olstyle.Style({
            stroke: new olstyle.Stroke({
              color: [255, 0, 0, 1],
              width: 2
            }),
            fill: new olstyle.Fill({
              color: [255, 0, 0, 0.2]
            }),
            image: new olstyle.Circle({
              radius: 8,
              stroke: new olstyle.Stroke({
                color: [255, 0, 0, 1]
              }),
              fill: new olstyle.Fill({
                color: [255, 0, 0, 0.2]
              })
            })
          })
        }
      },
      {
        name: 'name',
        title: 'Name',
        options: {
          validator: Validators.required
        }
      }
    ];

    const fields: FormField[] = fieldConfigs.map((config: FormFieldConfig) => this.formService.field(config));
    const form: Form = this.formService.form(
      [],
      [this.formService.group({ name: 'info' }, fields)]
    );

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
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-106, 42],
            [-107, 31],
            [-81, 32],
            [-82, 42],
            [-106, 42]
          ]
        ]
      })
    });
  }

  clearForm() {
    this.form$.value.control.reset();
  }

  onSubmit(data: { [key: string]: any }) {
    alert(JSON.stringify(data));
  }
}
