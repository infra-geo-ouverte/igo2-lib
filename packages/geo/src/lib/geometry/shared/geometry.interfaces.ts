import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import { GeoJsonGeometryTypes } from 'geojson';

import { FormFieldInputs } from '@igo2/common';

import { IgoMap } from '../../map';

export interface GeometryFormFieldInputs extends FormFieldInputs {
  map: IgoMap;
  geometryType: typeof OlGeometryType;
  tooltip?: string;
}

export interface GeoJSONGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
