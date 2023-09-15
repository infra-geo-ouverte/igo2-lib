import { Injectable, OnDestroy } from '@angular/core';

import { Action } from '@igo2/common';

import { BehaviorSubject, Subscription } from 'rxjs';
import { FeatureWorkspace } from '@igo2/geo';
import {
  StorageService,
  StorageServiceEvent,
  StorageServiceEventEnum,
  LanguageService,
  MediaService
} from '@igo2/core';
import { StorageState } from '../../storage/storage.state';
import { skipWhile } from 'rxjs/operators';
import { ToolState } from '../../tool/tool.state';
import { getWorkspaceActions, handleZoomAuto } from './workspace.utils';
import { DatePipe } from '@angular/common';

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
    private storageState: StorageState,
    public languageService: LanguageService,
    private toolState: ToolState,
    private mediaService: MediaService,
    private datePipe: DatePipe
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
      .pipe(skipWhile((storageChange: StorageServiceEvent) =>
        storageChange?.key !== 'zoomAuto' || storageChange?.event === StorageServiceEventEnum.CLEARED))
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
      this.datePipe);
  }
}
