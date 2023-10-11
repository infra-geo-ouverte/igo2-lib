export interface Projection {
  alias?: string;
  code: string;
  def: string;
  extent: [number, number, number, number];
}
export interface InputProjections extends Projection {
  translateKey?: string;
  translatedValue?: string;
  zone: string;
}
export interface ProjectionsLimitationsOptions {
  projFromConfig?: boolean;
  nad83?: boolean;
  wgs84?: boolean;
  webMercator?: boolean;
  utm?: boolean;
  mtm?: boolean;
  utmZone?: {
    minZone?: number;
    maxZone?: number;
  };
  mtmZone?: {
    minZone?: number;
    maxZone?: number;
  };
}
