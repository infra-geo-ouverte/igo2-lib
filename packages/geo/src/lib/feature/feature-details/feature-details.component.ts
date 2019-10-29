import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NetworkService, ConnectionState } from '@igo2/core';

import { getEntityTitle, getEntityIcon } from '@igo2/common';

import { Feature } from '../shared';
import { SearchSource } from '../../search/shared/sources/source';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureDetailsComponent {
  private state: ConnectionState;

  @Input()
  get source(): SearchSource {
    return this._source;
  }
  set source(value: SearchSource ) {
    this._source = value;
    this.cdRef.detectChanges();
  }

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
    this.cdRef.detectChanges();
  }

  private _feature: Feature;
  private _source: SearchSource;

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
    private sanitizer: DomSanitizer,
    private networkService: NetworkService
  ) {
    this.networkService.currentState().subscribe((state: ConnectionState) => {
      this.state = state;
    });
  }

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
        if (this.state.connection && feature.meta && feature.meta.excludeAttribute) {
          const excludeAttribute = feature.meta.excludeAttribute;
          excludeAttribute.forEach(attribute => {
            delete feature.properties[attribute];
          });
        } else if (!this.state.connection && feature.meta && feature.meta.excludeAttributeOffline) {
          const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            delete feature.properties[attribute];
          });
        }
        return feature.properties;
    }
  }
}
