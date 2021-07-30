import GeometryType from 'ol/geom/GeometryType';
import { GeoJsonGeometryTypes } from 'geojson';

import { FormFieldInputs } from '@igo2/common';

import { IgoMap } from '../../map';

export interface GeometryFormFieldInputs extends FormFieldInputs {
  map: IgoMap;
  geometryType: GeometryType;
  tooltip?: string;
}

export interface GeoJSONGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
