import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Feature } from '../shared';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureDetailsComponent {
  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
    this.cdRef.detectChanges();
  }
  private _feature: Feature;

  constructor(
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  isUrl(value): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  isObject(value) {
    return typeof value === 'object';
  }

  filterFeatureProperties(feature) {
    const allowedFieldsAndAlias = feature.alias;
    const properties = Object.assign({}, feature.properties);

    if (allowedFieldsAndAlias) {
      Object.keys(properties).forEach(property => {
        if (Object.keys(allowedFieldsAndAlias).indexOf(property) === -1) {
          delete properties[property];
        } else {
          properties[allowedFieldsAndAlias[property]] = properties[property];
          if (allowedFieldsAndAlias[property] !== property) {
            delete properties[property];
          }
        }
      });
      return properties;
    } else {
      return feature.properties;
    }
  }
}
