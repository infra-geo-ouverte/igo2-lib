import {
  Workspace,
  WorkspaceOptions
} from '@igo2/common';
import { BehaviorSubject } from 'rxjs';

import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';

export interface FeatureWorkspaceOptions extends WorkspaceOptions {
  layer: VectorLayer;
  map: IgoMap;
}

export class FeatureWorkspace extends Workspace {

  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get layer(): VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  constructor(protected options: FeatureWorkspaceOptions) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (mapResolution > this.layer.minResolution && mapResolution < this.layer.maxResolution) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });
  }
  
  public getLayerWksOptionNoQueryClickInTab(): boolean {
    if (this.options && this.options.layer?.options?.workspace?.noQueryOnClickInTab){
      return this.options.layer.options.workspace.noQueryOnClickInTab;
    }
    return false;
  }
}
