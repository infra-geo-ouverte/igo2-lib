import { EntityKey } from '@igo2/common/entity';

import { Feature } from '../../../feature/shared/feature.interfaces';
import { Layer } from '../../../layer';

export interface WorkspaceData {
  index: EntityKey;
  feature: Feature;
  layer: Layer;
  field: string;
  score: number;
}
