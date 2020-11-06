import {
  Workspace,
  WorkspaceOptions
} from '@igo2/common';

import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';

export interface FeatureWorkspaceOptions extends WorkspaceOptions {
  layer: VectorLayer;
  map: IgoMap;
}

export class FeatureWorkspace extends Workspace {

  get layer(): VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  constructor(protected options: FeatureWorkspaceOptions) {
    super(options);
  }
}
