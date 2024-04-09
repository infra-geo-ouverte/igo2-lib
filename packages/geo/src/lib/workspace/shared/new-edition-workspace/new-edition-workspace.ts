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

  private isLoadingVal = false;
  get isLoading() {
    return this.isLoadingVal;
  }

  get layer(): ImageLayer | VectorLayer {
    return this.options.layer;
  }

  get map(): IgoMap {
    return this.options.map;
  }

  constructor(
    private http: HttpClient,
    protected options: EditionWorkspaceOptions
  ) {
    super(options);
  }

  createFeature(feature: Object) {
    throw Error('Not yet implemented');
  }

  editFeature(feature: Object) {
    throw Error('Not yet implemented');
  }

  deleteFeature(feature: Object) {
    throw Error('Not yet implemented');
  }

  saveFeature(feature: Object) {
    throw Error('Not yet implemented');
  }

  cancelEdit(feature: Object) {
    throw Error('Not yet implemented');
  }

  abstract getUpdateBody(): Object;
  abstract getCreateBody(): Object;
}
