import { EditionWorkspace, FeatureWorkspace, WfsWorkspace } from '.';
import { NewEditionWorkspace } from '../new-edition-workspace/new-edition-workspace';

export type AnyWorkspace =
  | FeatureWorkspace
  | WfsWorkspace
  | EditionWorkspace
  | NewEditionWorkspace;
