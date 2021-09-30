import {
  Workspace,
  WorkspaceOptions
} from '@igo2/common';
import { BehaviorSubject } from 'rxjs';

import { ImageLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export class EditionWorkspace extends Workspace {

  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get layer(): ImageLayer | VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  constructor(protected options: EditionWorkspaceOptions) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (mapResolution > this.layer.minResolution && mapResolution < this.layer.maxResolution) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });
  }
}
