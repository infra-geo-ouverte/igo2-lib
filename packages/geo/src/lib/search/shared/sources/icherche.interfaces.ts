import { FeatureGeometry } from '../../../feature/shared/feature.interfaces';

export interface IChercheData {
  index: string;
  geometry: FeatureGeometry;
  bbox: [number, number, number, number];
  properties: Record<string, any>;
  icon?: string;
  highlight: {
    title: string;
    title2?: string;
    title3?: string;
  };
  score?: number;
}

export interface IChercheResponse {
  features: IChercheData[];
}

export interface IChercheReverseData {
  geometry: FeatureGeometry;
  bbox: [number, number, number, number];
  icon?: string;
  properties: Record<string, any>;
}

export interface IChercheReverseResponse {
  features: IChercheReverseData[];
}
