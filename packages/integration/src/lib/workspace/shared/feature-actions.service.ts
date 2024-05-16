import { Inject, Injectable, OnDestroy } from '@angular/core';

import { Action } from '@igo2/common/action';
import { Widget } from '@igo2/common/widget';
import { LanguageService } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';
import {
  StorageService,
  StorageServiceEvent,
  StorageServiceEventEnum
} from '@igo2/core/storage';
import { FeatureWorkspace, InteractiveSelectionFormWidget } from '@igo2/geo';

import { BehaviorSubject, Subscription } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { StorageState } from '../../storage/storage.state';
import { ToolState } from '../../tool/tool.state';
import { getWorkspaceActions, handleZoomAuto } from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class FeatureActionsService implements OnDestroy {
  public maximize$: BehaviorSubject<boolean>;

  zoomAuto$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storageChange$$: Subscription;

  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(
    @Inject(InteractiveSelectionFormWidget)
    private interactiveSelectionFormWidget: Widget,
    private storageState: StorageState,
    public languageService: LanguageService,
    private toolState: ToolState,
    private mediaService: MediaService
  ) {
    this.maximize$ = new BehaviorSubject(
      this.storageService.get('workspaceMaximize') as boolean
    );
  }

  ngOnDestroy(): void {
    if (this.storageChange$$) {
      this.storageChange$$.unsubscribe();
    }
  }

  loadActions(
    workspace: FeatureWorkspace,
    rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
    selectOnlyCheckCondition$: BehaviorSubject<boolean>
  ) {
    const actions = this.buildActions(
      workspace,
      rowsInMapExtentCheckCondition$,
      selectOnlyCheckCondition$
    );
    workspace.actionStore.load(actions);
  }

  buildActions(
    workspace: FeatureWorkspace,
    rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
    selectOnlyCheckCondition$: BehaviorSubject<boolean>
  ): Action[] {
    this.zoomAuto$.next(this.zoomAuto);
    this.storageChange$$ = this.storageService.storageChange$
      .pipe(
        skipWhile(
          (storageChange: StorageServiceEvent) =>
            storageChange?.key !== 'zoomAuto' ||
            storageChange?.event === StorageServiceEventEnum.CLEARED
        )
      )
      .subscribe(() => {
        this.zoomAuto$.next(this.zoomAuto);
        handleZoomAuto(workspace, this.storageService);
      });
    return getWorkspaceActions(
      workspace,
      rowsInMapExtentCheckCondition$,
      selectOnlyCheckCondition$,
      undefined,
      this.zoomAuto$,
      this.maximize$,
      this.storageService,
      this.languageService,
      this.mediaService,
      this.toolState,
      this.interactiveSelectionFormWidget
    );
  }
}
