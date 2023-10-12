import { Workspace, WorkspaceOptions } from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

import { VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared';

export interface WfsWorkspaceOptions extends WorkspaceOptions {
  layer: VectorLayer;
  map: IgoMap;
}

export class WfsWorkspace extends Workspace {
  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(
    true
  );

  get layer(): VectorLayer {
    return this.options.layer;
  }

  get map(): IgoMap {
    return this.options.map;
  }

  constructor(protected options: WfsWorkspaceOptions) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (
        mapResolution > this.layer.minResolution &&
        mapResolution < this.layer.maxResolution
      ) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });
  }

  public getLayerWksOptionTabQuery(): boolean {
    if (this.layer.options.workspace.queryOptions?.tabQuery !== undefined) {
      return this.layer.options.workspace.queryOptions.tabQuery;
    }
    return true;
  }

  public getLayerWksOptionMapQuery(): boolean {
    if (
      this.layer.options.workspace.queryOptions?.mapQueryOnOpenTab !== undefined
    ) {
      return this.layer.options.workspace.queryOptions.mapQueryOnOpenTab;
    }
    return true;
  }

  private getInResolutionRange(): boolean {
    return this.inResolutionRange$.value;
  }
}
