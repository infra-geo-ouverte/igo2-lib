import { FeatureGeometry } from '../../../feature';

export interface IChercheData {
  index: string;
  geometry: FeatureGeometry;
  bbox: [number, number, number, number];
  properties: { [key: string]: any };
  highlight: {
    title: string;
    title2?: string;
    title3?: string;
    title4?: string;
    title5?: string;
  };
}

export interface IChercheResponse {
  features: IChercheData[];
}

export interface IChercheReverseData {
  geometry: FeatureGeometry;
  bbox: [number, number, number, number];
  properties: { [key: string]: any };
}

export interface IChercheReverseResponse {
  features: IChercheReverseData[];
}
