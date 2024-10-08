import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';

import { ImageLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';

export interface WmsWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer;
  map: IgoMap;
}

export class WmsWorkspace extends Workspace {
  get layer(): ImageLayer {
    return this.options.layer;
  }

  get map(): IgoMap {
    return this.options.map;
  }

  constructor(protected options: WmsWorkspaceOptions) {
    super(options);
  }
}
