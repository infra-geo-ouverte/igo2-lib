import { NewEditionWorkspace } from '../new-edition-workspace/new-edition-workspace';
import { EditionWorkspace, FeatureWorkspace, WfsWorkspace } from './';

export type LayerWorkspace =
  | FeatureWorkspace
  | WfsWorkspace
  | EditionWorkspace
  | NewEditionWorkspace;
