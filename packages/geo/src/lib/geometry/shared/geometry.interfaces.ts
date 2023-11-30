import { FormFieldInputs } from '@igo2/common';

import type { Type } from 'ol/geom/Geometry';

import { GeoJsonGeometryTypes } from 'geojson';

import { IgoMap } from '../../map/shared/map';

export interface GeometryFormFieldInputs extends FormFieldInputs {
  map: IgoMap;
  geometryType: Type;
  tooltip?: string;
}

export interface GeoJSONGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
