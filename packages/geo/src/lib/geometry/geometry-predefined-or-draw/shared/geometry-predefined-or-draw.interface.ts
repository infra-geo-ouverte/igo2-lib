import { Feature } from "../../../feature/shared/feature.interfaces";

export interface FeatureForPredefinedOrDrawGeometry extends Feature<FeatureForPredefinedOrDrawGeometryProperties> {}

export interface FeatureForPredefinedOrDrawGeometryProperties {
    id: string | number;
    title: string;
    _predefinedType: string;
    _buffer?: number;
  }
