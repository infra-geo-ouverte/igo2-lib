import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild
} from '@angular/core';

import { getEntityRevision } from '@igo2/common/entity';
import { Form, FormComponent } from '@igo2/common/form';
import { uuid } from '@igo2/utils';

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
  imports: [FormComponent]
})
export class FeatureFormComponent {
  /**
   * Form
   */
  readonly form = input<Form>(undefined);
  readonly feature = input<Feature | undefined>(undefined);

  /**
   * Event emitted when the form is submitted
   */
  readonly submitForm = output<Feature>();

  readonly igoForm = viewChild<FormComponent>('igoForm');

  /**
   * Transform the form data to a feature and emit an event
   * @param event Form submit event
   * @internal
   */
  onSubmit(data: Record<string, any>) {
    const feature = this.formDataToFeature(data);
    this.submitForm.emit(feature);
  }

  getData(): Feature {
    return this.formDataToFeature(this.igoForm().getData());
  }

  /**
   * Transform the form data to a feature
   * @param data Form data
   * @returns A feature
   */
  private formDataToFeature(data: Record<string, any>): Feature {
    const properties = {};
    const meta = {};
    const feature = this.feature();
    if (feature === undefined) {
      (meta as any).id = uuid();
    } else {
      Object.assign(properties, feature.properties);
      Object.assign(meta, feature.meta, {
        revision: getEntityRevision(feature) + 1
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
    if (geometry === undefined && feature !== undefined) {
      geometry = feature.geometry;
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
