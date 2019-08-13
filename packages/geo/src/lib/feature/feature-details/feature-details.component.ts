import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { getEntityTitle, getEntityIcon } from '@igo2/common';

import { Feature } from '../shared';
import { NetworkService, ConnectionState } from '@igo2/core';
import { MVTDataSourceOptions, XYZDataSourceOptions, FeatureDataSourceOptions } from '../../datasource';
import { MapService } from '../../map/shared/map.service';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureDetailsComponent {

  private state: ConnectionState;

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
    private sanitizer: DomSanitizer,
    private networkService: NetworkService,
    private mapService: MapService
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
    let sourceOptions;
    const allowedFieldsAndAlias = feature.meta ? feature.meta.alias : undefined;
    const properties = Object.assign({}, feature.properties);
    const layerName = feature.meta.title;
    const layers = this.mapService.getMap().layers$.value;

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
      layers.forEach(layer => {
        if (layer.dataSource.options.type === 'mvt') {
          sourceOptions = (layer.dataSource.options as MVTDataSourceOptions);
        } else if (layer.dataSource.options.type === 'xyz') {
          sourceOptions = (layer.dataSource.options as XYZDataSourceOptions);
        } else if (layer.dataSource.options.type === 'vector') {
          sourceOptions = (layer.dataSource.options as FeatureDataSourceOptions);
        } else {
          return;
        }
        if (this.state.connection && sourceOptions.excludeAttribute) {
          const exclude = sourceOptions.excludeAttribute;
          exclude.forEach(attribute => {
            if (layerName === layer.title) {
                delete feature.properties[attribute];
            }
          });
        } else if (!this.state.connection && sourceOptions.excludeAttributeOffline) {
          const excludeAttributeOffline = sourceOptions.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            if (layerName === layer.title) {
                delete feature.properties[attribute];
            }
          });
        }
      });
      return feature.properties;
    }
  }
}
