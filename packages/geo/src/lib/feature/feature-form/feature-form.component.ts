import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { Form, getEntityRevision } from '@igo2/common';
import { FormComponent } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { BehaviorSubject } from 'rxjs';

import { FEATURE } from '../shared/feature.enums';
import { Feature, FeatureMeta } from '../shared/feature.interfaces';

/**
 * A configurable form, optionnally bound to a feature.
 * This component creates an entity form and, on submit,
 * returns a feature made out of the submitted data. It also
 * does things like managing the feature visibility while it's being updated
 * as well as disabling the selection of another feature.
 */
@Component({
  selector: 'igo-feature-form',
  templateUrl: './feature-form.component.html',
  styleUrls: ['./feature-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormComponent, AsyncPipe]
})
export class FeatureFormComponent {
  /**
   * Form
   */
  @Input() form: Form;

  /**
   * Feature to update
   */
  @Input()
  set feature(value: Feature | undefined) {
    this.feature$.next(value);
  }
  get feature(): Feature | undefined {
    return this.feature$.value;
  }
  readonly feature$: BehaviorSubject<Feature> = new BehaviorSubject(undefined);

  /**
   * Event emitted when the form is submitted
   */
  @Output() submitForm = new EventEmitter<Feature>();

  @ViewChild('igoForm', { static: true }) igoForm: FormComponent;

  constructor() {}

  /**
   * Transform the form data to a feature and emit an event
   * @param event Form submit event
   * @internal
   */
  onSubmit(data: { [key: string]: any }) {
    const feature = this.formDataToFeature(data);
    this.submitForm.emit(feature);
  }

  getData(): Feature {
    return this.formDataToFeature(this.igoForm.getData());
  }

  /**
   * Transform the form data to a feature
   * @param data Form data
   * @returns A feature
   */
  private formDataToFeature(data: { [key: string]: any }): Feature {
    const properties = {};
    const meta = {};
    if (this.feature === undefined) {
      (meta as any).id = uuid();
    } else {
      Object.assign(properties, this.feature.properties);
      Object.assign(meta, this.feature.meta, {
        revision: getEntityRevision(this.feature) + 1
      });
    }

    const propertyPrefix = 'properties.';
    Object.entries(data).forEach((entry: [string, any]) => {
      const [key, value] = entry;
      if (key.startsWith(propertyPrefix)) {
        const property = key.substr(propertyPrefix.length);
        properties[property] = value;
      }
    });

    let geometry = data.geometry;
    if (geometry === undefined && this.feature !== undefined) {
      geometry = this.feature.geometry;
    }

    return {
      meta: meta as FeatureMeta,
      type: FEATURE,
      geometry,
      projection: 'EPSG:4326',
      properties
    };
  }
}
