import { HttpClient } from '@angular/common/http';

import { Workspace, WorkspaceOptions } from '@igo2/common';

import { ImageLayer, VectorLayer } from '../../../layer/shared';
import { IgoMap } from '../../../map/shared/map';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export abstract class NewEditionWorkspace extends Workspace {
  // TODO !!IMPORTANT!! rename to EditionWorkspace
  constructor(
    private http: HttpClient,
    protected options: EditionWorkspaceOptions
  ) {
    super(options);
  }

  createFeature() {
    throw Error('Not yet implemented');
  }

  updateFeature() {
    throw Error('Not yet implemented');
  }

  deleteFeature() {
    throw Error('Not yet implemented');
  }

  abstract getUpdateBody(): Object;
  abstract getCreateBody(): Object;
}
