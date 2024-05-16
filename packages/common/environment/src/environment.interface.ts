export interface EnvironmentOptions {
  depot?: DepotOptions;
  interactiveTour?: InteractiveTourConfigOptions;
}

export interface DepotOptions {
  url: string;
  trainingGuides?: string[];
}

export interface InteractiveTourConfigOptions {
  activateInteractiveTour?: boolean;
  tourInMobile?: boolean;
  pathToConfigFile?: string;
}
