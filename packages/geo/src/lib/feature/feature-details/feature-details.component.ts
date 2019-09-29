import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { getEntityTitle, getEntityIcon } from '@igo2/common';

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

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.feature);
  }

  /**
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.feature) || 'link';
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  htmlSanitizer(value): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  isObject(value) {
    return typeof value === 'object';
  }

  isUrl(value) {
    if (typeof value === 'string') {
      return (
        value.slice(0, 8) === 'https://' || value.slice(0, 7) === 'http://'
      );
    } else {
      return false;
    }
  }

  filterFeatureProperties(feature) {
    const allowedFieldsAndAlias = feature.meta ? feature.meta.alias : undefined;

    const properties = {};
    if (allowedFieldsAndAlias) {
      Object.keys(allowedFieldsAndAlias).forEach(field => {
        if (feature.properties[field]) {
          properties[allowedFieldsAndAlias[field]] = feature.properties[field];
        }
      });
      return properties;
    } else {
      return feature.properties;
    }
  }
}
