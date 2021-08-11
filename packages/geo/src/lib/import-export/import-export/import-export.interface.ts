// todo pel mettre dans un interface dans projection...? packages\geo\src\lib\map\shared\projection.interfaces.ts ?
export interface InputProjections {
  translateKey?: string;
  translatedValue?: string;
  alias: string;
  code: string;
  zone: string;
}

// todo pel mettre dans un interface dans projection...? packages\geo\src\lib\map\shared\projection.interfaces.ts ?
export interface ProjectionsLimitationsOptions {
  projFromConfig?: boolean;
  nad83?: boolean;
  wgs84?: boolean;
  webMercator?: boolean;
  utm?: boolean;
  mtm?: boolean;
  utmZone?: {
    minZone?: number,
    maxZone?: number
  };
  mtmZone?: {
    minZone?: number,
    maxZone?: number
  };
}
