import { GeoJSON } from 'geojson';

import { SourceFieldsOptionsParams } from '../../datasource';
import {
  NewEditionFeature,
  NewEditionWorkspace
} from './new-edition-workspace';

export class RestAPIEdition extends NewEditionWorkspace {
  private get dataSourceOptions() {
    return this.layer.dataSource.options;
  }

  getUpdateBody(feature: NewEditionFeature): GeoJSON {
    // TODO support Geometry
    // TODO check if id exists
    return {
      type: 'Feature',
      id: feature.properties.id,
      geometry: feature.geometry as GeoJSON.Geometry,
      properties: feature.properties
    };
  }

  getCreateBody(feature: NewEditionFeature): object {
    // TODO support geometry
    const fieldsToRemove = this.getPropertyKeys(
      (sourceField) =>
        sourceField.validation?.readonly === true &&
        sourceField.primary === true
    );
    return this.removeProperties(feature, fieldsToRemove);
  }

  private getPropertyKeys(
    predicate: (sourceField: SourceFieldsOptionsParams) => boolean
  ) {
    const sourceFields = this.dataSourceOptions.sourceFields ?? [];
    return sourceFields
      .filter(predicate)
      .map((sourceField) => sourceField.name);
  }

  private removeProperties(
    feature: NewEditionFeature,
    fieldsToRemove: string[]
  ) {
    const properties = { ...feature.properties };
    for (const field of fieldsToRemove) {
      delete properties[field];
    }
    return properties;
  }
}
