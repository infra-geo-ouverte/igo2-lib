import { Feature } from '../../../feature/shared/feature.interfaces';
import { Layer } from '../../../layer';

export interface WorkspaceData {
  index: any;
  feature: Feature;
  layer: Layer;
  field: string;
  score: number;
}
