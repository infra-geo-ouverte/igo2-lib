import { DOMOptions } from '../dom';

export interface CommonOptions {
  depot?: DepotOptions;
  dom?: DOMOptions[];
  interactiveTour?: InteractiveTourConfigOptions;
}

interface DepotOptions {
  url: string;
  /** TODO PELORD SHOULD BE DEPRECATED? */
  trainingGuides?: string[];
}

export interface InteractiveTourConfigOptions {
  activateInteractiveTour: boolean;
  tourInMobile: boolean;
  pathToConfigFile?: string;
}
