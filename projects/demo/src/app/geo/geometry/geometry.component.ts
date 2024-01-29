import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Form, FormField, FormFieldConfig, FormService } from '@igo2/common';
import { DataSourceService, IgoMap, LayerOptions, LayerService, MapViewOptions, OSMDataSource, OSMDataSourceOptions } from '@igo2/geo';

import * as olstyle from 'ol/style';

import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-geometry',
  templateUrl: './geometry.component.html',
  styleUrls: ['./geometry.component.scss']
})
export class AppGeometryComponent implements OnInit, OnDestroy {
  map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 15
  };

  form$: BehaviorSubject<Form> = new BehaviorSubject<Form>(undefined);

  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);

  submitDisabled: boolean = true;

  private valueChanges$$: Subscription;

  constructor(
    private formService: FormService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit(): void {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
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

  ngOnDestroy(): void {
    this.valueChanges$$.unsubscribe();
  }

  fillForm(): void {
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

  clearForm(): void {
    this.form$.value.control.reset();
  }

  onSubmit(data: { [key: string]: any }): void {
    alert(JSON.stringify(data));
  }
}
