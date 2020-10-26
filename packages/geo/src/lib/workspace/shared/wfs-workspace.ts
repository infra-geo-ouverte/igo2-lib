import {
  Workspace,
  WorkspaceOptions
} from '@igo2/common';
import { BehaviorSubject } from 'rxjs';

import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';

export interface WfsWorkspaceOptions extends WorkspaceOptions {
  layer: VectorLayer;
  map: IgoMap;
}

export class WfsWorkspace extends Workspace {

  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get layer(): VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  constructor(protected options: WfsWorkspaceOptions) {
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
