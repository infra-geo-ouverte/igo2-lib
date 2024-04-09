import {
  EditionWorkspace,
  FeatureWorkspace,
  NewEditionWorkspace,
  WfsWorkspace
} from './';

export type LayerWorkspace =
  | FeatureWorkspace
  | WfsWorkspace
  | EditionWorkspace
  | NewEditionWorkspace;
