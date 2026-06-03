import { NewEditionWorkspace } from '../new-edition-workspace/new-edition-workspace';
import { EditionWorkspace } from './edition-workspace';
import { FeatureWorkspace } from './feature-workspace';
import { WfsWorkspace } from './wfs-workspace';

export type AnyWorkspace =
  | WfsWorkspace
  | FeatureWorkspace
  | EditionWorkspace
  | NewEditionWorkspace;
